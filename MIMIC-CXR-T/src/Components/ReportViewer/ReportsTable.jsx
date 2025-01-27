
function ReportsTable({ 
  report,
  isSwitchChecked
}) {
    const originalSentences = report.sentences;
    const translatedSentences = report.translated_sentences;
    const query = new URLSearchParams(window.location.search);
    const sentenceId = query.get('sentenceId');

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
            return (
              <tr key={index} className='px-3 py-1 h-auto' style={{ backgroundColor: parseInt(sentenceId) === sentence.id ? 'rgba(255, 179, 37, 0.59)' : ''}}
              >
                <td className='w-[50%] pr-2'>{sentence.text}</td>
                <td className='w-[50%] pl-2'>
                   { nonEmptyTranslatedSentences[index]?.text || ''}                
                </td>
              </tr>
            );
          })}
        </table>
      </>
      );
    });
  }


export default ReportsTable;

