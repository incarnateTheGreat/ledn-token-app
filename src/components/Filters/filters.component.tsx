import React, { useCallback, useContext } from "react";
import { CSVLink } from "react-csv";
import debounce from "lodash.debounce";
import { LednTokenContext } from "interfaces/interfaces";
import { FILTERS, TABLE } from "utils/messages";

const headers = [
  { label: TABLE.FIRST_NAME, key: TABLE.FIRST_NAME_KEY },
  { label: TABLE.LAST_NAME, key: TABLE.LAST_NAME_KEY },
  { label: TABLE.COUNTRY, key: TABLE.COUNTRY_KEY },
  { label: TABLE.EMAIL, key: TABLE.EMAIL_KEY },
  { label: TABLE.DATE_OF_BIRTH, key: TABLE.DATE_OF_BIRTH_KEY },
  {
    label: TABLE.MULTI_FACTOR_AUTH_TYPE,
    key: TABLE.MULTI_FACTOR_AUTH_TYPE_KEY,
  },
  { label: TABLE.AMT, key: TABLE.AMT_KEY },
  { label: TABLE.CREATION_DATE, key: TABLE.CREATION_DATE_KEY },
  { label: TABLE.REFERRED_BY, key: TABLE.REFERRED_BY_KEY },
];

const Filters = () => {
  const {
    accountsData,
    filterBy,
    searchInput,
    clearFilters,
    updateURLParams,
    setAccountsPerPage,
    setFilterBy,
    setLoading,
    setSearchInput,
    setPageNumber,
  } = useContext(LednTokenContext);

  const handleSearchInput = (searchString) => {
    // When the search input is cleared, go to the first page.
    if (searchString.length === 0) {
      setPageNumber(1);
    }

    updateURLParams({ [`${filterBy}_like`]: searchString, _page: 1 });
    setLoading(false);
  };

  // Fire the search input function after a short frame of time to prevent multiple data calls and collisions.
  const debounceSearchInputHandler = useCallback(
    debounce(handleSearchInput, 250),
    [filterBy]
  );

  return (
    <div className="ledn-token-filter-container">
      <div className="ledn-token-filter-container-excel">
        {accountsData?.data.length > 0 && (
          <CSVLink
            className={"excel-icon"}
            data={accountsData?.data}
            headers={headers}
            title={FILTERS.DOWNLOAD_CSV}
          >
            <img src="../icons/excel-icon.png" alt={FILTERS.DOWNLOAD_CSV} />
          </CSVLink>
        )}
      </div>
      <div className="ledn-token-filter-container-filters">
        <button
          className="--border"
          type="button"
          title={FILTERS.CLEAR_ALL_FILTERS}
          onClick={() => clearFilters()}
        >
          {FILTERS.CLEAR_ALL_FILTERS}
        </button>
        <div>
          <label htmlFor="accounts-per-page">{FILTERS.ACCOUNTS_PER_PAGE}</label>
          <select
            name="accounts-per-page"
            id="accounts-per-page"
            onChange={(e) => {
              setAccountsPerPage(+e.target.value);
            }}
            defaultValue={10}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-by">{FILTERS.FILTER_BY}</label>
          <select
            name="filter-by"
            id="filter-by"
            onChange={(e) => {
              clearFilters();
              setFilterBy(e.target.value);
            }}
            defaultValue={TABLE.FIRST_NAME}
          >
            <option value={TABLE.FIRST_NAME}>{TABLE.FIRST_NAME}</option>
            <option value={TABLE.LAST_NAME}>{TABLE.LAST_NAME}</option>
            <option value={TABLE.COUNTRY}>{TABLE.COUNTRY}</option>
            <option value="mfa">{TABLE.MULTI_FACTOR_AUTH_TYPE}</option>
          </select>
          <input
            type="search"
            placeholder={`Search ${filterBy}`}
            value={searchInput}
            onChange={(e) => {
              setLoading(true);
              debounceSearchInputHandler(e.target.value);
              setSearchInput(e.target.value);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;
