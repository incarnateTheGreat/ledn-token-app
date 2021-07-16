import React, { useContext } from "react";
import { LednTokenContext } from "../../interfaces/interfaces";

const Pagination = () => {
  const {
    pageNumber,
    nextPageNumber,
    prevPageNumber,
    setPageNumber,
    lastPageNumber,
  } = useContext(LednTokenContext);

  const assignActivePageClass = (page) => (pageNumber === page ? "active" : "");

  return (
    <nav className="ledn-token-pagination">
      <button
        disabled={!prevPageNumber}
        type="button"
        title="Back to the first page"
        onClick={() => {
          if (prevPageNumber) {
            setPageNumber(1);
          }
        }}
      >
        &#171;
      </button>
      <button
        disabled={!prevPageNumber}
        type="button"
        title="Back"
        onClick={() => {
          if (prevPageNumber) {
            setPageNumber(prevPageNumber);
          }
        }}
      >
        &#8249;
      </button>
      {Array(lastPageNumber)
        .fill(null)
        .map((_, i) => (
          <button
            key={i}
            type="button"
            className={assignActivePageClass(i + 1)}
            onClick={() => setPageNumber(i + 1)}
            title={`Page ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      <button
        disabled={pageNumber === lastPageNumber}
        type="button"
        title="Forward"
        onClick={() => {
          if (pageNumber < lastPageNumber) {
            setPageNumber(nextPageNumber);
          }
        }}
      >
        &#8250;
      </button>
      <button
        disabled={pageNumber === lastPageNumber}
        type="button"
        title="Forward to the last page"
        onClick={() => {
          if (pageNumber < lastPageNumber) {
            setPageNumber(lastPageNumber);
          }
        }}
      >
        &#187;
      </button>
    </nav>
  );
};

export default Pagination;
