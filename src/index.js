import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { ApolloClient, InMemoryCache, useQuery } from "@apollo/client";
import { LIST_COUNTRIES } from "./queries";
import "./index.css";

// initialize a GraphQL client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://countries.trevorblades.com",
});

function CountryData({ continentCode, limit }) {
  const { loading, error, data } = useQuery(LIST_COUNTRIES, {
    client,
    variables: { continentCode },
  });

  const [showResults, setShowResults] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [tryAgainButton, setTryAgainButton] = useState(false);

  useEffect(() => {
    if (!loading && !error) {
      const shuffledCountries = data.continent.countries
        .map((country) => ({ ...country, code: country.name.charCodeAt(0) }))
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
        .sort((a, b) => a.name.localeCompare(b.name));

      const updatedCountryData = [];

      // Fetch missing data for each country
      Promise.all(
        shuffledCountries.map(async (country) => {
          try {
            const response = await fetch(
              `https://restcountries.com/v2/name/${country.name}`
            );
            const [data] = await response.json();

            updatedCountryData.push({
              ...country,
              population: data.population,
              subregion: data.subregion,
            });
          } catch (error) {
            console.error(error);
            updatedCountryData.push(country);
          }
        })
      ).then(() => {
        // Update state only when all countries are processed
        setCountryData(
          updatedCountryData.sort((a, b) => a.name.localeCompare(b.name))
        );
      });
    }
  }, [loading, error, data, limit]);

  const handleClick = () => {
    setShowResults(true);
    setTryAgainButton(true);
  };

  const handleTryAgainClick = () => {
    setShowResults(false);
    setTryAgainButton(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (countryData.length === 0 && tryAgainButton) {
    return (
      <>
        <p>No information found for any country. Please try again later.</p>
        <button onClick={handleTryAgainClick}>Try Again</button>
      </>
    );
  }

  return (
    <div>
      <h1>Countries from {continentCode}</h1>
      {countryData.map((country, index) => (
        <div key={index}>
          <h3>{country.name}</h3>
          {country.name && (
            <>
              <p>Name: {country.name}</p>
              <p>Native name: {country.native || "No information found!"}</p>
              <p>Capital: {country.capital || "No information found!"}</p>
              <p>Population: {country.population || "No information found!"}</p>
              <p>Currency: {country.currency || "No information found!"}</p>
              <p>Subregion: {country.subregion || "No information found!"}</p>
              <p>
                Languages:{" "}
                {country.languages.length > 0
                  ? country.languages.map((language, index) => (
                      <span key={index}>
                        {language.name} ({language.code})
                        {index !== country.languages.length - 1 && ", "}
                      </span>
                    ))
                  : "No information found!"}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [continentCode, setContinentCode] = useState("");
  const [limit, setLimit] = useState(10);
  const [showOptions, setShowOptions] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showTryAgainButton, setShowTryAgainButton] = useState(false);

  const handleContinentChange = (event) => {
    setContinentCode(event.target.value);
    setShowOptions(false);
    setShowResults(false);
    setShowTryAgainButton(false);
  };

  const handleLimitChange = (event) => {
    const value = parseInt(event.target.value);
    setLimit(value >= 2 && value <= 10 ? value : limit);
    setShowResults(false);
  };

  const handleClick = () => {
    setShowResults(true);
    setShowTryAgainButton(true);
  };

  const handleTryAgainClick = () => {
    setContinentCode("");
    setShowOptions(true);
    setShowResults(false);
    setShowTryAgainButton(false);
  };

  return (
    <div>
      <h1>Select Continent</h1>
      <select value={continentCode} onChange={handleContinentChange}>
        <option value="">-- Select Continent --</option>
        <option value="AF">Africa</option>
        <option value="AN">Antarctica</option>
        <option value="AS">Asia</option>
        <option value="EU">Europe</option>
        <option value="NA">North America</option>
        <option value="OC">Oceania</option>
        <option value="SA">South America</option>
      </select>
      <h1>Select Number of Countries</h1>
      <button
        onClick={() => handleLimitChange({ target: { value: limit - 1 } })}
      >
        -
      </button>
      <span>{limit}</span>
      <button
        onClick={() => handleLimitChange({ target: { value: limit + 1 } })}
      >
        +
      </button>
      {showResults && continentCode && limit && (
        <div>
          <CountryData continentCode={continentCode} limit={limit} />
          {showTryAgainButton && (
            <button onClick={handleTryAgainClick}>Try Again?</button>
          )}
        </div>
      )}
      {!showResults && (
        <button
          className="result-button"
          disabled={!continentCode || !limit}
          onClick={handleClick}
        >
          Show Results
        </button>
      )}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
