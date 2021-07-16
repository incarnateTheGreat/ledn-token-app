import React, { useCallback, useContext } from "react";
import { CSVLink } from "react-csv";
import debounce from "lodash.debounce";
import { LednTokenContext } from "../../interfaces/interfaces";

const headers = [
  { label: "First Name", key: "First Name" },
  { label: "Last Name", key: "Last Name" },
  { label: "Country", key: "Country" },
  { label: "Email", key: "email" },
  { label: "Date of Birth", key: "dob" },
  { label: "Multi-factor Authentication Type", key: "mfa" },
  { label: "# of Ledn Tokens", key: "amt" },
  { label: "Creation Date", key: "createdDate" },
  { label: "Referred By", key: "ReferredBy" },
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
  } = useContext(LednTokenContext);

  const handleSearchInput = (searchString) => {
    updateURLParams({ [`${filterBy}_like`]: searchString });
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
            title="Download CSV"
          >
            <img src="../icons/excel-icon.png" alt="Download CSV" />
          </CSVLink>
        )}
      </div>
      <div className="ledn-token-filter-container-filters">
        <button
          className="--border"
          type="button"
          title="Clear all filters"
          onClick={() => clearFilters()}
        >
          Clear all filters
        </button>
        <div>
          <label htmlFor="accounts-per-page">Accounts per Page:</label>
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
          <label htmlFor="filter-by">Filter by:</label>
          <select
            name="filter-by"
            id="filter-by"
            onChange={(e) => {
              clearFilters();
              setFilterBy(e.target.value);
            }}
            defaultValue="First Name"
          >
            <option value="First Name">First Name</option>
            <option value="Last Name">Last Name</option>
            <option value="Country">Country</option>
            <option value="mfa">Multi-factor Authentication Type</option>
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
