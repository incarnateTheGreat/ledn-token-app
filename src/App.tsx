import React, { useCallback, useEffect, useState } from "react";
import debounce from "lodash.debounce";
import { CSVLink } from "react-csv";
import { dateTimeFormat, encodeQueryData } from "./utils/utils";
import { getAccountsData } from "./api/api";

interface AccountsData {
  Country: string;
  "First Name": string;
  "Last Name": string;
  ReferredBy: string;
  amt: number;
  createdDate: string;
  dob: string;
  email: string;
  mfa: string | null;
}

interface AccountsDataResponse {
  data: AccountsData[];
  total: number;
  links: {
    first?: number;
    last?: number;
    prev?: number;
    next?: number;
  };
}

const App = () => {
  const ascArrow = "▲";
  const downArrow = "▼";
  const [accountsPerPage, setAccountsPerPage] = useState<number>(10);
  const [accountsData, setAccountsData] = useState<AccountsDataResponse | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<string>("ASC");
  const [selectedSortColumn, setSelectedSortColumn] = useState<string | null>(
    null
  );
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [nextPageNumber, setNextPageNumber] = useState<number | null>(null);
  const [prevPageNumber, setPrevPageNumber] = useState<number | null>(null);
  const [lastPageNumber, setLastPageNumber] = useState<number | null>(null);
  const [filterBy, setFilterBy] = useState<string>("First Name");
  const [searchInput, setSearchInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [URLParams, setURLParams] = useState<Record<string, unknown>>({
    _page: 1,
    _limit: accountsPerPage,
  });
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

  // Get the accounts data on render.
  const getData = async () => {
    const accountsDataRes = await getAccountsData(encodeQueryData(URLParams));

    setAccountsData(accountsDataRes);
    setPrevPageNumber(accountsDataRes?.links?.prev ?? null);
    setNextPageNumber(accountsDataRes?.links?.next);
    setLastPageNumber(accountsDataRes?.links?.last);
  };

  // Call the data on render.
  useEffect(() => {
    if (URLParams) {
      getData();
    }
  }, [URLParams]);

  // Listners for Page number and URL changes.
  useEffect(() => {
    updateURLParams({ _page: pageNumber });
  }, [pageNumber]);

  useEffect(() => {
    updateURLParams({ _limit: accountsPerPage });
  }, [accountsPerPage]);

  const updateURLParams = (queryParams) => {
    setURLParams((prevState) => {
      const sortStateToUpdate = queryParams;

      return { ...prevState, ...sortStateToUpdate };
    });
  };

  // Apply a "like" search for the specific filter field.
  const handleSearchInput = (searchString) => {
    updateURLParams({ [`${filterBy}_like`]: searchString });
    setLoading(false);
  };

  // Fire the search input function after a short frame of time to prevent multiple data calls and collisions.
  const debounceSearchInputHandler = useCallback(
    debounce(handleSearchInput, 250),
    [filterBy]
  );

  // Sort selected data data either ascending or descending.
  const sortData = (col: string) => {
    const newSortDirection = sortDirection === "ASC" ? "DESC" : "ASC";

    setSortDirection(newSortDirection);
    setSelectedSortColumn(col);
    updateURLParams({ _sort: col, _order: newSortDirection });
  };

  // When changing the filter dropdown, remove existing filters to neutralize the search.
  const clearFilters = () => {
    const clearedFilters: Record<string, unknown> = Object.keys(
      URLParams
    ).reduce((acc, curr) => {
      if (curr.indexOf("_like") === -1) {
        acc[curr] = URLParams[curr];
      }

      return acc;
    }, {});

    setURLParams(clearedFilters);
    setSearchInput("");
    setSelectedSortColumn(null);
  };

  // Assign classes and sort direction arrows.
  const assignSelectedColumnClass = (col) =>
    selectedSortColumn === col ? "selectedColumn" : "";

  const assignActivePageClass = (page) => (pageNumber === page ? "active" : "");

  const assignSortArrow = (col) => {
    if (selectedSortColumn === col) {
      return sortDirection === "ASC" ? ascArrow : downArrow;
    }

    return null;
  };

  return (
    <div className="App">
      <nav className="nav">
        <div className="nav-container">
          <h1>Ledn Tracker</h1>
        </div>
      </nav>
      <section className="ledn-token">
        {loading && (
          <div className="loading">
            <span>Loading...</span>
          </div>
        )}
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
        {!loading && accountsData?.data.length > 0 && (
          <>
            <table className="ledn-token-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Country</th>
                  <th>Email</th>
                  <th>Date of Birth</th>
                  <th>Multi-factor Authentication Type</th>
                  <th
                    className="sortableHeader"
                    onClick={() => {
                      sortData("amt");
                    }}
                  >
                    <span> AMT </span>
                    <span>{assignSortArrow("amt")}</span>
                  </th>
                  <th
                    className="sortableHeader"
                    onClick={() => {
                      sortData("createdDate");
                    }}
                  >
                    <span> Creation Date </span>
                    <span>{assignSortArrow("createdDate")}</span>
                  </th>
                  <th>Referred By</th>
                </tr>
              </thead>
              <tbody>
                {accountsData?.data.map((account, key) => {
                  const {
                    "First Name": firstName,
                    "Last Name": lastName,
                    Country: country,
                    ReferredBy: referredBy,
                    email,
                    dob,
                    amt,
                    createdDate,
                    mfa,
                  } = account;

                  return (
                    <tr key={key}>
                      <td>{firstName}</td>
                      <td>{lastName}</td>
                      <td>{country}</td>
                      <td>{email}</td>
                      <td>{dateTimeFormat(dob) ?? "N/A"}</td>
                      <td>{mfa}</td>
                      <td className={`${assignSelectedColumnClass("amt")}`}>
                        {amt}
                      </td>
                      <td
                        className={`${assignSelectedColumnClass(
                          "createdDate"
                        )}`}
                      >
                        {dateTimeFormat(createdDate) ?? "N/A"}
                      </td>
                      <td>{referredBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <nav className="ledn-token-table-pagination">
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
          </>
        )}

        {!loading && accountsData?.data.length === 0 && (
          <div className="ledn-token-no-data">Sorry. There are no results.</div>
        )}
      </section>
    </div>
  );
};

export default App;
