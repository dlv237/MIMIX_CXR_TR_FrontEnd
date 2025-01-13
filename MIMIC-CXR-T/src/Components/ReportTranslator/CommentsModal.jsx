import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { getCommentByTranslatedSentenceId, createComment, updateComment } from '../../utils/api'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { AuthContext } from '../../auth/AuthContext'
import { useContext } from 'react'

function CommentsModal({open, setOpen, sentenceId}) {
  const { token } = useContext(AuthContext);
  const [comment, setComment] = useState("")
  const [commentStatus, setCommentStatus] = useState(null)
  const [commentId, setCommentId] = useState(null)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await getCommentByTranslatedSentenceId(sentenceId, token)
        console.log(response)
        setComment(response.comment)
        setCommentStatus(response.state)
        setCommentId(response.id)
      } catch (error) {
        console.error('Error fetching comments:', error)
        setComment("")
        setCommentStatus(null)
        setCommentId(null)
      }
    }
    fetchComments()
  }, [sentenceId, token, open])
        
  const handleSubmit = async () => {
    if (comment.trim() === ""){
      toast.error('El comentario no puede estar vacío')
      return
    }
    
    try {
      if (commentStatus){
        await updateComment(commentId, comment, "No revisado", token)
        toast.success('Comentario actualizado con éxito')
      } else {
        await createComment(sentenceId, comment, token)
        toast.success('Comentario creado con éxito')
      }
      setOpen(false)
    } catch (error) {
      console.error('Error creating comment:', error)
      toast.error('Error creando el comentario')
      
    }
    
  }

  console.log(sentenceId)

  return (
    <Dialog open={open} onClose={setOpen} style={{zIndex: 9998}} className="relative">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="bg-indigo-700 px-4 p-6">
                    <div className="flex items-center justify-between">

                      <DialogTitle className="text-lg mb-1 font-semibold text-white">Deja tu comentario</DialogTitle>
                      <div className="ml-3 flex h-7 items-center size-12">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative rounded-md bg-indigo-700 text-indigo-200"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1">
                      <p className="text-md text-indigo-300 pr-6">
                        Si tienes alguna duda o comentario sobre esta oración, déjala aquí. Un administrador revisará tu comentario lo antes posible.
                      </p>
                    </div>
                  </div>
                  <div className='p-6 mt-2'>
                    {commentStatus && (
                      <span className="inline-flex items-center gap-x-1.5 rounded-md bg-yellow-100 px-1.5 py-0.5 text-md font-medium text-yellow-800">
                        <svg viewBox="0 0 6 6" aria-hidden="true" className="size-1.5 fill-yellow-500">
                          <circle r={3} cx={3} cy={3} />
                        </svg>
                        {commentStatus}
                      </span>
                    )
                  }
                  </div>
                  <div className='p-6 mt'>
                    <label htmlFor="project-description" className="block text-lg font-medium text-gray-900">
                      Comentario
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="project-description"
                        name="project-description"
                        rows={3}
                        className="p-2 block w-full min-h-[24rem] max-h-[36rem] rounded-md bg-white px-3 py-1.5 text-md text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                        defaultValue={comment}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex shrink-0 justify-end px-4 py-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    onClick={() => handleSubmit()}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default CommentsModal;