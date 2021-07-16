import { createContext, Dispatch, SetStateAction } from "react";

export interface AccountsData {
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

export interface AccountsDataResponse {
  data: AccountsData[];
  total: number;
  links: {
    first?: number;
    last?: number;
    prev?: number;
    next?: number;
  };
}

export interface LednTokenValues {
  accountsData: AccountsDataResponse;
  clearFilters: () => void;
  filterBy: string;
  setFilterBy: Dispatch<SetStateAction<string>>;
  searchInput: string;
  setSearchInput: Dispatch<SetStateAction<string>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean | null>>;
  accountsPerPage: number;
  setAccountsPerPage: Dispatch<SetStateAction<number | null>>;
  nextPageNumber: number;
  setNextPageNumber: Dispatch<SetStateAction<number | null>>;
  prevPageNumber: number;
  setPrevPageNumber: Dispatch<SetStateAction<number | null>>;
  lastPageNumber: number;
  setPageNumber: Dispatch<SetStateAction<number | null>>;
  pageNumber: number;
  updateURLParams: (e) => void;
}

export const LednTokenContext = createContext({} as LednTokenValues);
