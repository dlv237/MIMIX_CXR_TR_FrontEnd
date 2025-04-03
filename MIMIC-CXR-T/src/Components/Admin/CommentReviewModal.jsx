import { getTranslatedSentenceById, updateCommentState} from "../../utils/api";
import { useEffect, useState } from "react";
import { Dialog } from '@headlessui/react'
import { useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import { toast } from "react-hot-toast";

function CommentReviewModal({
  commentData,
  isModalOpen,
  setIsModalOpen,
  onCommentReviewed,
}) {
  const { token } = useContext(AuthContext);
  const [translatedSentence, setTranslatedSentence] = useState(null);

  const handleMarkAsReviewed = async () => {
    try {
      await updateCommentState(commentData.id, "Revisado", token);
      setIsModalOpen(false);
      toast.success('Comentario marcado como revisado');
      onCommentReviewed();
    } catch (error) {
      console.error('Error marking comment as reviewed:', error);
      toast.error('Error al marcar el comentario como revisado');
    }
  }

  useEffect(() => {
    if (!commentData) return;
    const fetchTranslatedSentence = async () => {
      try {
        const sentence = await getTranslatedSentenceById(commentData.translatedSentenceId, token);
        setTranslatedSentence(sentence);
      } catch (error) {
        console.error('Error fetching translated sentence:', error);
      }

    };
    fetchTranslatedSentence();
  }, [commentData, token]);

  if (!commentData) return null;

  return (
    <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-10">
      {/* Fondo difuminado */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Contenedor centrado */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-md rounded bg-white p-6">
          <Dialog.Title className="text-xl font-semibold mb-4">Revisar Comentario</Dialog.Title>
          <p className="text-sm mb-2"><strong>Comentario:</strong></p>
          <p className="text-sm mb-4">{commentData.comment}</p>        
          <p className="text-sm mb-4 flex items-center gap-x-2">
            <strong>Estado:</strong> 
            {commentData.state === "No revisado" ? (
              <span className="inline-flex items-center gap-x-1.5 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                <svg viewBox="0 0 6 6" aria-hidden="true" className="size-1.5 fill-yellow-500">
                  <circle r={3} cx={3} cy={3} />
                </svg>
                No revisado
              </span>
            ) : (
              <span className="inline-flex items-center gap-x-1.5 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                <svg viewBox="0 0 6 6" aria-hidden="true" className="size-1.5 fill-green-500">
                  <circle r={3} cx={3} cy={3} />
                </svg>
                Revisado
              </span>
            )}
          </p>
          {translatedSentence && (
            <div className="mb-12">
              
              <p className="text-sm font-semibold mb-2">Frase original:</p>
              <p className="text-sm mb-4">{translatedSentence.sentence.text}</p>
              <p className="text-sm font-semibold mb-2">Frase traducida:</p>
              <p className="text-sm">{translatedSentence.translatedSentence.text}</p>
            </div>
          )}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => window.open(`/report-viewer/${translatedSentence.reportGroupId}/report/${translatedSentence.indexReport - 1}?sentenceId=${translatedSentence.sentence.id}`, '_blank')}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Ver reporte
            </button>
            <button
              type="button"
              onClick={() => { setIsModalOpen(false), handleMarkAsReviewed()}}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Marcar como revisado
            </button>
          </div>

        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default CommentReviewModal;