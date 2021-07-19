import React, { useCallback, useMemo, useEffect, useState } from "react";
import { dateTimeFormat, encodeQueryData } from "utils/utils";
import { GENERAL, TABLE, ERRORS } from "utils/messages";
import { getAccountsData } from "api/api";
import {
  AccountsDataResponse,
  LednTokenContext,
  LednTokenValues,
} from "./interfaces/interfaces";
import Pagination from "components/Pagination/pagination.component";
import Filters from "components/Filters/filters.component";

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

  // Sort selected data data either ascending or descending.
  const sortData = (col: string) => {
    const newSortDirection = sortDirection === "ASC" ? "DESC" : "ASC";

    setSortDirection(newSortDirection);
    setSelectedSortColumn(col);
    updateURLParams({ _sort: col, _order: newSortDirection });
  };

  // When changing the filter dropdown, remove existing filters to neutralize the search.
  const clearFilters = useCallback(() => {
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
  }, [URLParams]);

  // Assign classes and sort direction arrows.
  const assignSelectedColumnClass = (col) =>
    selectedSortColumn === col ? "selectedColumn" : "";

  const assignSortArrow = (col) => {
    if (selectedSortColumn === col) {
      return sortDirection === "ASC" ? ascArrow : downArrow;
    }

    return null;
  };

  const values: LednTokenValues = useMemo(
    () => ({
      loading,
      accountsPerPage,
      accountsData,
      filterBy,
      searchInput,
      prevPageNumber,
      setPrevPageNumber,
      nextPageNumber,
      setNextPageNumber,
      pageNumber,
      setPageNumber,
      lastPageNumber,
      clearFilters,
      updateURLParams,
      setAccountsPerPage,
      setFilterBy,
      setLoading,
      setSearchInput,
    }),
    [
      clearFilters,
      loading,
      accountsPerPage,
      accountsData,
      filterBy,
      searchInput,
      prevPageNumber,
      nextPageNumber,
      pageNumber,
      lastPageNumber,
    ]
  );

  return (
    <LednTokenContext.Provider value={values}>
      <div className="App">
        <nav className="nav">
          <div className="nav-container">
            <h1>{GENERAL.LEDN_TOKEN}</h1>
          </div>
        </nav>
        <section className="ledn-token">
          {loading && (
            <div className="loading">
              <span>Loading...</span>
            </div>
          )}
          <Filters />

          {!loading && accountsData?.data.length > 0 && (
            <article className="ledn-token-accounts">
              {accountsData?.data.length > 0 && <Pagination />}
              <table className="ledn-token-accounts-table">
                <thead>
                  <tr>
                    <th title={TABLE.FIRST_NAME}>{TABLE.FIRST_NAME}</th>
                    <th title={TABLE.LAST_NAME}>{TABLE.LAST_NAME}</th>
                    <th title={TABLE.COUNTRY}>{TABLE.COUNTRY}</th>
                    <th title={TABLE.EMAIL}>{TABLE.EMAIL}</th>
                    <th title={TABLE.DATE_OF_BIRTH}>{TABLE.DATE_OF_BIRTH}</th>
                    <th title={TABLE.MULTI_FACTOR_AUTH_TYPE}>
                      {TABLE.MULTI_FACTOR_AUTH_TYPE}
                    </th>
                    <th
                      className="sortableHeader"
                      onClick={() => {
                        sortData("amt");
                      }}
                    >
                      <span> {TABLE.AMT} </span>
                      <span>{assignSortArrow("amt")}</span>
                    </th>
                    <th
                      title={TABLE.CREATION_DATE}
                      className="sortableHeader"
                      onClick={() => {
                        sortData("createdDate");
                      }}
                    >
                      <span>{TABLE.CREATION_DATE}</span>
                      <span>{assignSortArrow("createdDate")}</span>
                    </th>
                    <th title={TABLE.REFERRED_BY}>{TABLE.REFERRED_BY}</th>
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
              {accountsData?.data.length > 0 && <Pagination />}
            </article>
          )}

          {!loading && accountsData?.data.length === 0 && (
            <div className="ledn-token-accounts-no-data">
              {ERRORS.NO_RESULTS}
            </div>
          )}

          {!loading && !accountsData && (
            <div className="ledn-token-accounts-no-data">
              {ERRORS.SERVER_ERROR}
            </div>
          )}
        </section>
        <footer className="footer">
          <div className="footer-container">
            &copy; {GENERAL.LEDN_TOKEN} {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </LednTokenContext.Provider>
  );
};

export default App;
