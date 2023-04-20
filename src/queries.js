import { gql } from "@apollo/client";

export const LIST_COUNTRIES = gql`
  query GetCountries($continentCode: ID!) {
    continents {
      code
    }
    continent(code: $continentCode) {
      countries {
        name
        native
        capital
        currency
        languages {
          name
          code
        }
      }
    }
  }
`;
