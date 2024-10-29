import { ToggleButton } from 'react-bootstrap';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

function ReportSentencesTable({ 
  report,
  isCrossedSentences,
  isSwitchChecked,
  translatedSentencesState,
  suggestionData,
  sentencesSuggestions,
  handleTranslatedSentenceClick,
}) {
    const originalSentences = report.sentences;
    const translatedSentences = report.translated_sentences;
    if (originalSentences == null || translatedSentences == null) {
      return null;
    }

    const types = ["background", "findings", "impression"];
    return types.map((type) => {
      const nonEmptyOriginalSentences = originalSentences[type].filter((sentence) => sentence.text.trim() !== "");
      const nonEmptyTranslatedSentences = translatedSentences[type].filter((sentence) => sentence.text.trim() !== "");

      if (nonEmptyOriginalSentences.length === 0 && nonEmptyTranslatedSentences.length === 0) {
        return null;
      }
      return (
        <React.Fragment key={type}>
          {isSwitchChecked && (
            <tr className="title-row">
              <th className="title-row">{type}</th>
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
              <tr key={index}>
                <td className='w-[45%]'>{sentence.text}</td>
                <td className='w-[45%]'>
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
                </td>
              </tr>
            );
          })}
        </React.Fragment>
      );
    });
  }


export default ReportSentencesTable;

