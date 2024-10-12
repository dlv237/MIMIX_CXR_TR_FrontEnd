import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { Prism as SyntaxHighlighter, SyntaxHighlighterProps } from "react-syntax-highlighter"
import { atomDark as oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { ClipboardDocumentIcon, XMarkIcon, PaintBrushIcon } from "@heroicons/react/24/outline"
import { toast } from "react-hot-toast"
import Color, { colorHexMap } from "../colors"

const highlightColors = [
  Color.yellow,
  Color.fuchsia,
  Color.red,
  Color.green,
  Color.blue,
  Color.purple,
  Color.pink,
  Color.orange,
  Color.teal,
  Color.cyan,
]
SyntaxHighlighterProps

const CodeHighlighter = ({
  inline,
  className,
  customStyle,
  style = oneDark,
  children,
  showCopyButton = true,
}) => {
  const match = /language-(\w+)/.exec(className || "")
  if (inline) {
    return <span className="break-words inline embed font-mono text-sm bg-inherit text-inherit">{children}</span>
  }
  return (
    <div className="flex flex-row">
      <div className={showCopyButton ? "w-[calc(100%-48px)]" : "w-full"}>
        <SyntaxHighlighter
          language={match ? match[1] : "plaintext"}
          PreTag="div"
          style={style}
          customStyle={{ margin: "0px", ...(customStyle || {}) }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
      {showCopyButton && (
        <div className="w-[48px] bg-gray-800">
          <button
            type="button"
            className="text-gray-400 h-full w-full flex justify-center pt-3 hover:text-gray-200"
            onClick={() => {
              navigator.clipboard
                .writeText(String(children).replace(/\n$/, ""))
                .then(() => {
                  toast.success("Copied to clipboard")
                })
                .catch(() => {
                  toast.error("Failed to copy")
                })
            }}
          >
            <ClipboardDocumentIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

const HighlightMarkdownDisplay = ({
  text,
  darkMode,
  questionId,
  customClassName = "mt-2",
  customCodeStyle = {},
  codeStyle = oneDark,
  showCodeCopyButton = true,
}) => {
  const [highlightedText, setHighlightedText] = useState(text)


  const [selection, setSelection] = useState<Selection | null>(null)
  const [highlightColor, setHighlightColor] = useState<Color>(() => {
    const savedColor = localStorage.getItem("highlightColor")
    return savedColor && highlightColors.includes(savedColor) ? savedColor : Color.yellow
  })

  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const markdownRef = useRef<HTMLDivElement | null>(null)
  const paletteRef = useRef<HTMLDivElement | null>(null)

  const normalizeMarks = () => {
    if (markdownRef.current) {
      const marks = markdownRef.current.querySelectorAll("mark")

      marks.forEach((mark) => {
        const descendantMarks = Array.from(mark.querySelectorAll("mark")).filter(
          (descMark) => descMark.parentElement === mark && descMark.style.backgroundColor === mark.style.backgroundColor
        )

        descendantMarks.forEach((descMark) => {
          while (descMark.firstChild) {
            mark.insertBefore(descMark.firstChild, descMark)
          }
          descMark.remove()
        })
      })

      const updatedContent = markdownRef.current.innerHTML
      setHighlightedText(updatedContent)
      localStorage.setItem(`highlightedContent_${questionId}`, updatedContent)
    }
  }

  useEffect(() => {
    const savedContent = localStorage.getItem(`highlightedContent_${questionId}`)
    if (savedContent) {
      setHighlightedText(savedContent)
      setTimeout(() => {
        normalizeMarks()
      }, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId])

  useEffect(() => {
    localStorage.setItem("highlightColor", highlightColor)
  }, [highlightColor])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target)) {
        setIsPaletteOpen(false)
      }
    }

    if (isPaletteOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isPaletteOpen])

  const handleMouseUp = () => {
    const selectionObj = window.getSelection()
    if (selectionObj && selectionObj.rangeCount > 0) {
      const range = selectionObj.getRangeAt(0)
      const selectedText = selectionObj.toString()
      if (selectedText) {
        let startNode = range.startContainer
        let endNode = range.endContainer

        if (startNode.nodeType === Node.TEXT_NODE && startNode.parentNode) {
          startNode = startNode.parentNode
        }
        if (endNode.nodeType === Node.TEXT_NODE && endNode.parentNode) {
          endNode = endNode.parentNode
        }

        const getBlockAncestor = (node) => {
          while (node && node !== markdownRef.current) {
            const { display } = window.getComputedStyle(node)
            if (display === "block" || display === "table" || display === "list-item") {
              return node
            }
            // eslint-disable-next-line no-param-reassign
            node = node.parentNode
          }
          return null
        }

        const startBlock = getBlockAncestor(startNode)
        const endBlock = getBlockAncestor(endNode)

        if (startBlock !== endBlock) {
          setSelection(null)
          return
        }

        const rect = range.getBoundingClientRect()

        setSelection({
          text: selectedText,
          range: range.cloneRange(),
          rect,
        })
      } else {
        setSelection(null)
      }
    }
  }

  const handleDocumentMouseDown = () => {
    const selectionObj = window.getSelection()
    if (selectionObj && selectionObj.rangeCount > 0 && selectionObj.toString()) {
      return
    }
    setSelection(null)
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleDocumentMouseDown)
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown)
    }
  }, [])

  const addHighlight = () => {
    if (selection) {
      const { range } = selection

      const selectedContents = range.extractContents()

      const wrapUnhighlightedTextNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent && node.textContent.trim() !== "") {
            const parent = node.parentNode
            if (
              parent &&
              parent.nodeName.toLowerCase() === "mark" &&
              parent.style.backgroundColor === colorHexMap[highlightColor]
            ) {
              return node.cloneNode(true)
            }
            const mark = document.createElement("mark")
            mark.style.backgroundColor = colorHexMap[highlightColor]
            mark.textContent = node.textContent
            return mark
          }
          return node.cloneNode(true)
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node
          if (element.nodeName.toLowerCase() === "mark") {
            const newMark = element.cloneNode(false)
            element.childNodes.forEach((child) => {
              newMark.appendChild(wrapUnhighlightedTextNodes(child))
            })
            return newMark
          }
          const newElement = element.cloneNode(false)
          element.childNodes.forEach((child) => {
            newElement.appendChild(wrapUnhighlightedTextNodes(child))
          })
          return newElement
        }
        return node.cloneNode(true)
      }

      const newContents = document.createDocumentFragment()
      selectedContents.childNodes.forEach((child) => {
        newContents.appendChild(wrapUnhighlightedTextNodes(child))
      })

      range.insertNode(newContents)

      normalizeMarks()

      const updatedContent = markdownRef.current?.innerHTML || ""
      setHighlightedText(updatedContent)
      localStorage.setItem(`highlightedContent_${questionId}`, updatedContent)

      setSelection(null)
    }
  }

  const removeHighlight = () => {
    if (selection) {
      const { range } = selection

      const { startContainer } = range
      const { endContainer } = range
      const selectedText = range.toString()

      if (
        startContainer === endContainer &&
        (startContainer.parentNode).nodeName.toLowerCase() === "mark"
      ) {
        const parentMark = startContainer.parentNode

        const beforeText = startContainer.textContent?.slice(0, range.startOffset)
        const afterText = startContainer.textContent?.slice(range.endOffset)

        const fragment = document.createDocumentFragment()

        if (beforeText) {
          const beforeMark = document.createElement("mark")
          beforeMark.style.backgroundColor = parentMark.style.backgroundColor
          beforeMark.textContent = beforeText
          fragment.appendChild(beforeMark)
        }
        const textNode = document.createTextNode(selectedText)
        fragment.appendChild(textNode)

        if (afterText) {
          const afterMark = document.createElement("mark")
          afterMark.style.backgroundColor = parentMark.style.backgroundColor
          afterMark.textContent = afterText
          fragment.appendChild(afterMark)
        }

        parentMark.replaceWith(fragment)
      } else {
        const selectedContents = range.cloneContents()

        const unwrapMarks = (node, fragment) => {
          node.childNodes.forEach((child) => {
            if (child.nodeType === Node.ELEMENT_NODE && (child).nodeName.toLowerCase() === "mark") {
              unwrapMarks(child, fragment)
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const newElement = child.cloneNode(false)
              unwrapMarks(child, newElement)
              fragment.appendChild(newElement)
            } else {
              fragment.appendChild(child.cloneNode(true))
            }
          })
        }

        const newFragment = document.createDocumentFragment()
        unwrapMarks(selectedContents, newFragment)

        range.deleteContents()
        range.insertNode(newFragment)
      }

      const updatedContent = markdownRef.current?.innerHTML || ""
      setHighlightedText(updatedContent)
      localStorage.setItem(`highlightedContent_${questionId}`, updatedContent)

      setSelection(null)
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <div ref={markdownRef} onMouseUp={handleMouseUp} role="presentation">
        <ReactMarkdown
          className={`prose max-w-full prose-pre:p-0 break-words ${customClassName} ${darkMode ? "prose-invert" : ""}`}
          remarkPlugins={[remarkGfm]}
          // @ts-expect-error: rehypeRaw types are not compatible
          rehypePlugins={[rehypeRaw]}
          skipHtml={false}
          components={{
            // eslint-disable-next-line react/no-unstable-nested-components
            code: ({ children, inline, className }) => (
              <CodeHighlighter
                inline={inline}
                className={className}
                style={codeStyle}
                customStyle={customCodeStyle}
                showCopyButton={showCodeCopyButton}
              >
                {children}
              </CodeHighlighter>
            ),
          }}
        >
          {highlightedText}
        </ReactMarkdown>
      </div>

      {selection && (
        <div
          style={{
            position: "fixed",
            left: selection.rect.right + 5,
            top: selection.rect.top - 50,
            zIndex: 1000,
          }}
        >
          <div className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-md relative" ref={paletteRef}>
            <button
              type="button"
              onClick={() => setIsPaletteOpen((prev) => !prev)}
              className={`w-8 h-8 rounded-full border-2 transition border-transparent ${
                isPaletteOpen ? "border-blue-500" : "border-transparent"
              }`}
              style={{ backgroundColor: colorHexMap[highlightColor] }}
              title="Choose Highlight Color"
              aria-label="Choose Highlight Color"
            />

            {isPaletteOpen && (
              <div className="absolute top-12 left-0 bg-white p-2 rounded-md shadow-lg grid grid-cols-5 gap-3 justify-items-center transition-opacity duration-200 opacity-100">
                {highlightColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setHighlightColor(color)
                      setIsPaletteOpen(false)
                    }}
                    className={`w-6 h-6 rounded-full border-2 ${
                      highlightColor === color ? "border-black" : "border-transparent"
                    } relative focus:outline-none`}
                    style={{ backgroundColor: colorHexMap[color] }}
                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                    aria-label={`Select ${color.charAt(0).toUpperCase() + color.slice(1)} highlight`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setHighlightColor(color)
                        setIsPaletteOpen(false)
                      }
                    }}
                  >
                    {highlightColor === color && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="h-3 w-3 text-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addHighlight}
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center"
              title="Add Highlight"
            >
              <PaintBrushIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={removeHighlight}
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 flex items-center"
              title="Remove Highlight"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HighlightMarkdownDisplay