import { getComments } from "../../utils/api";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import { InformationCircleIcon } from '@heroicons/react/20/solid'
import CommentReviewModal from "./CommentReviewModal";

function CommentsTable() {
  const { token } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsData = await getComments(token);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [token]);

  return (
    <>
      <div className="m-16">
        <h1 className="text-2xl font-bold">Comentarios</h1>
        <table className="min-w-full divide-y divide-gray-300 text-start mt-6">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 flex self-center sm:pl-0 w-[10%]"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 flex self-center w-[25%]"
              >
                Comentario
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 flex self-center w-[10%]"
              >
                Id de Frase
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 flex self-center w-[15%]"
              >
                Fecha de Creación
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 flex self-center w-[15%]"
              >
                Fecha de Actualización
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 flex self-center w-[10%]"
              >
                Estado
              </th>
              <th
                scope="col"
                className="relative py-3.5 pl-3 pr-4 sm:pr-0 w-[15%]"
              >
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <tr key={comment.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 flex self-center sm:pl-0 w-[10%]">
                  {comment.id}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 flex self-center w-[25%]">
                  {comment.comment.length > 50
                    ? comment.comment.substring(0, 50) + '...'
                    : comment.comment}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 flex self-center w-[10%]">
                  {comment.translatedSentenceId}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 flex self-center w-[15%]">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 flex self-center w-[15%]">
                  {new Date(comment.updatedAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 flex self-center w-[10%]">
                  {comment.state === "No revisado" ? (
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
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 w-[15%]">
                <button
                  type="button"
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => {
                    console.log("xd")
                    setIsModalOpen(true)
                    setSelectedComment(comment)}
                  }
                >
                  <InformationCircleIcon aria-hidden="true" className="-ml-0.5 size-5" />
                  Revisar
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <CommentReviewModal
          commentData={selectedComment}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      </div>
    </>
  );
}

export default CommentsTable;