import { ToggleButton } from 'react-bootstrap';
import { faCheck, faTimes, faComment } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommentsModal from './CommentsModal';
import { useState } from 'react';

function ReportSentencesTable({ 
  report,
  isCrossedSentences,
  isSwitchChecked,
  translatedSentencesState,
  suggestionData,
  sentencesSuggestions,
  handleTranslatedSentenceClick,
}) {
    const [open, setOpen] = useState(false);
    const originalSentences = report.sentences;
    const translatedSentences = report.translated_sentences;
    const [selectedTranslatedSentenceId, setSelectedTranslatedSentenceId] = useState(null);

    const handleOpenCommentsModal = (sentence) => {
      setSelectedTranslatedSentenceId(sentence.id);
      setOpen(true);
    };

    if (originalSentences == null || translatedSentences == null) {
      return null;
    }

    const types = ["background", "findings", "impression"];
    return types.map((type) => {
      const nonEmptyOriginalSentences = originalSentences[type].filter((sentence) => sentence.text.trim() !== "");
      const nonEmptyTranslatedSentences = translatedSentences[type].filter((sentence) => sentence.text && sentence.text.trim() !== "");

      if (nonEmptyOriginalSentences.length === 0 && nonEmptyTranslatedSentences.length === 0) {
        return null;
      }
      return (
        <>
          <table key={type} className='w-full min-w-[50rem]'>
          {isSwitchChecked && (
            <tr className="title-row w-full p-0">
              <th className="title-row content-center pl-4">{type}</th>
              <th className="title-row"></th>
              <th className="title-row w-[100%]"></th>
            </tr>
          )}
          {nonEmptyOriginalSentences.map((sentence, index) => {
            const translatedSentenceId = translatedSentences[type][index].id;
            const isChecked = translatedSentencesState[translatedSentenceId] === true;
            const suggestionAvailable = suggestionData[translatedSentenceId] !== undefined;
            const isCrossed = suggestionAvailable && (isChecked === false);
            const notReviewed = translatedSentencesState[translatedSentenceId] === null;

            return (
              <tr key={index} className='px-3 py-1 h-auto' style={{ backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.05)' : ''}}
              >
                <td className='w-[45%] pr-2'>{sentence.text}</td>
                <td className='w-[45%] pl-2'>
                  {notReviewed ? (
                    <p>{nonEmptyTranslatedSentences[index]?.text}</p>
                  ) : (
                    <>
                      {isCrossed || isCrossedSentences[translatedSentenceId] ? (
                        <p style={{ textDecoration: 'line-through', color: 'red' }}>
                          {nonEmptyTranslatedSentences[index]?.text || ''}
                        </p>
                      ) : (
                        nonEmptyTranslatedSentences[index]?.text || ''
                      )}
                      <br />
                      <p style={{ color: 'green' }}>
                        {isCrossed && suggestionAvailable ? suggestionData[translatedSentenceId] : sentencesSuggestions[translatedSentenceId] || ''}
                      </p>
                    </>
                  )}
                </td>
                <td className="button-row w-[10%] flex justify-center">
                  <ToggleButton
                    size="sm"
                    type="checkbox"
                    variant={isChecked ? 'success' : 'outline-success'}
                    onClick={() => handleTranslatedSentenceClick(translatedSentences[type][index], true)}
                    className="custom-toggle-button times"
                    id={`check-${translatedSentenceId || index}`}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </ToggleButton>
                  <ToggleButton
                    size="sm"
                    type="checkbox"
                    variant={translatedSentencesState[translatedSentenceId] === false ? 'danger' : 'outline-danger'}
                    onClick={() => handleTranslatedSentenceClick(translatedSentences[type][index], false)}
                    className="custom-toggle-button check"
                    id={`times-${translatedSentenceId || index}`}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </ToggleButton>
                  <ToggleButton
                    size="sm"
                    color="green"
                    onClick={() => handleOpenCommentsModal(translatedSentences[type][index])} // Usa una arrow function
                    className="custom-toggle-button check"
                    id={`times-${translatedSentenceId || index}`}
                  >
                    <FontAwesomeIcon icon={faComment} />
                  </ToggleButton>

                </td>
              </tr>
            );
          })}
        </table>
        { selectedTranslatedSentenceId && <CommentsModal open={open} setOpen={setOpen} sentenceId={selectedTranslatedSentenceId} /> }
      </>
      );
    });
  }


export default ReportSentencesTable;

