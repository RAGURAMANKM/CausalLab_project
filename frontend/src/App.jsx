import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const menuItems = [
    "Overview",
    "A/B Testing",
    "Sample Size Calculator",
    "Confidence Intervals",
    "Multiple Testing",
    "Bayesian Analysis",
    "Sequential Testing",
    "Causal Inference",
  ];

  // Restore the current page from browser history.
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = window.history.state?.causalLabTab;

    return typeof savedTab === "string" &&
      [
        "Overview",
        "A/B Testing",
        "Sample Size Calculator",
        "Confidence Intervals",
        "Multiple Testing",
        "Bayesian Analysis",
        "Sequential Testing",
        "Causal Inference",
      ].includes(savedTab)
      ? savedTab
      : "Overview";
  });

  const [backendMessage, setBackendMessage] =
    useState("Checking connection...");

  // Sample size calculator
  const [baselineRate, setBaselineRate] = useState("0.10");
  const [targetRate, setTargetRate] = useState("0.13");
  const [alpha, setAlpha] = useState("0.05");
  const [power, setPower] = useState("0.80");
  const [sampleResult, setSampleResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // A/B testing
  const [abRows, setAbRows] = useState([
    { group: "A", converted: "0", revenue: "0" },
    { group: "A", converted: "1", revenue: "100" },
    { group: "A", converted: "0", revenue: "0" },
    { group: "A", converted: "1", revenue: "80" },
    { group: "B", converted: "1", revenue: "120" },
    { group: "B", converted: "1", revenue: "150" },
    { group: "B", converted: "0", revenue: "0" },
    { group: "B", converted: "1", revenue: "90" },
  ]);

  const [abResult, setAbResult] = useState(null);
  const [abError, setAbError] = useState("");
  const [abLoading, setAbLoading] = useState(false);
  const [csvFileName, setCsvFileName] = useState("");

  // Multiple testing
  const [pValuesInput, setPValuesInput] = useState(
    "0.01, 0.03, 0.04, 0.20"
  );
  const [multipleAlpha, setMultipleAlpha] = useState("0.05");
  const [multipleResult, setMultipleResult] = useState(null);
  const [multipleError, setMultipleError] = useState("");
  const [multipleLoading, setMultipleLoading] = useState(false);

  // Sequential testing
  const [sequentialLooks, setSequentialLooks] = useState([
    {
      conversions_a: "20",
      total_a: "100",
      conversions_b: "25",
      total_b: "100",
    },
    {
      conversions_a: "40",
      total_a: "200",
      conversions_b: "55",
      total_b: "200",
    },
    {
      conversions_a: "60",
      total_a: "300",
      conversions_b: "80",
      total_b: "300",
    },
  ]);

  const [sequentialAlpha, setSequentialAlpha] = useState("0.05");
  const [sequentialResult, setSequentialResult] = useState(null);
  const [sequentialError, setSequentialError] = useState("");
  const [sequentialLoading, setSequentialLoading] = useState(false);

  // Confidence intervals
  const [ciConversionsA, setCiConversionsA] = useState("20");
  const [ciTotalA, setCiTotalA] = useState("200");
  const [ciConversionsB, setCiConversionsB] = useState("30");
  const [ciTotalB, setCiTotalB] = useState("200");
  const [ciAlpha, setCiAlpha] = useState("0.05");
  const [ciResult, setCiResult] = useState(null);
  const [ciError, setCiError] = useState("");
  const [ciLoading, setCiLoading] = useState(false);

  // Bayesian analysis
  const [bayesConversionsA, setBayesConversionsA] = useState("20");
  const [bayesTotalA, setBayesTotalA] = useState("200");
  const [bayesConversionsB, setBayesConversionsB] = useState("30");
  const [bayesTotalB, setBayesTotalB] = useState("200");
  const [bayesSamples, setBayesSamples] = useState("2000");
  const [bayesTune, setBayesTune] = useState("1000");
  const [bayesResult, setBayesResult] = useState(null);
  const [bayesError, setBayesError] = useState("");
  const [bayesLoading, setBayesLoading] = useState(false);

  // Causal inference
  const [causalMethod, setCausalMethod] = useState(
    "difference-in-differences"
  );

  const [causalData, setCausalData] = useState(
    JSON.stringify(
      [
        {
          unit: "treated",
          time: 1,
          treatment: 1,
          post: 0,
          outcome: 10,
          age: 35,
          income: 50000,
        },
        {
          unit: "treated",
          time: 2,
          treatment: 1,
          post: 0,
          outcome: 12,
          age: 35,
          income: 50000,
        },
        {
          unit: "treated",
          time: 3,
          treatment: 1,
          post: 1,
          outcome: 18,
          age: 35,
          income: 50000,
        },
        {
          unit: "treated",
          time: 4,
          treatment: 1,
          post: 1,
          outcome: 20,
          age: 35,
          income: 50000,
        },
        {
          unit: "control",
          time: 1,
          treatment: 0,
          post: 0,
          outcome: 9,
          age: 40,
          income: 45000,
        },
        {
          unit: "control",
          time: 2,
          treatment: 0,
          post: 0,
          outcome: 11,
          age: 40,
          income: 45000,
        },
        {
          unit: "control",
          time: 3,
          treatment: 0,
          post: 1,
          outcome: 12,
          age: 40,
          income: 45000,
        },
        {
          unit: "control",
          time: 4,
          treatment: 0,
          post: 1,
          outcome: 13,
          age: 40,
          income: 45000,
        },
      ],
      null,
      2
    )
  );

  const [causalTreatmentColumn, setCausalTreatmentColumn] =
    useState("treatment");
  const [causalTimeColumn, setCausalTimeColumn] = useState("post");
  const [causalOutcomeColumn, setCausalOutcomeColumn] =
    useState("outcome");
  const [causalCovariates, setCausalCovariates] =
    useState("age, income");
  const [causalUnitColumn, setCausalUnitColumn] = useState("unit");
  const [causalTimeSeriesColumn, setCausalTimeSeriesColumn] =
    useState("time");
  const [causalTreatedUnit, setCausalTreatedUnit] =
    useState("treated");
  const [causalInterventionTime, setCausalInterventionTime] =
    useState("3");
  const [causalResult, setCausalResult] = useState(null);
  const [causalError, setCausalError] = useState("");
  const [causalLoading, setCausalLoading] = useState(false);

  // Dashboard tools
  const tools = [
    {
      icon: "AB",
      title: "A/B Testing",
      description:
        "Compare two groups using conversion rates, t-tests, and chi-square tests.",
      button: "Open Analysis",
    },
    {
      icon: "N",
      title: "Sample Size Calculator",
      description:
        "Calculate how many users are needed to detect a meaningful difference.",
      button: "Calculate Sample Size",
    },
    {
      icon: "CI",
      title: "Confidence Intervals",
      description:
        "Estimate uncertainty around conversion rates and differences.",
      button: "View Intervals",
    },
    {
      icon: "MT",
      title: "Multiple Testing",
      description:
        "Apply Bonferroni and Benjamini-Hochberg corrections.",
      button: "Correct P-values",
    },
    {
      icon: "BA",
      title: "Bayesian Analysis",
      description:
        "Estimate conversion rates and the probability that one variant performs better.",
      button: "Run Bayesian Analysis",
    },
    {
      icon: "ST",
      title: "Sequential Testing",
      description:
        "Monitor experiment results at planned checkpoints as data accumulates.",
      button: "Open Sequential Testing",
    },
    {
      icon: "CI",
      title: "Causal Inference",
      description:
        "Explore propensity score matching, difference-in-differences, and synthetic control.",
      button: "Explore Methods",
    },
  ];

  // =====================================================
  // BROWSER BACK AND FORWARD NAVIGATION
  // =====================================================

  useEffect(() => {
    // Mark the current browser history entry as a CausalLab page.
    const currentState = window.history.state || {};

    window.history.replaceState(
      {
        ...currentState,
        causalLabTab: activeTab,
      },
      "",
      window.location.href
    );

    // When the user presses the browser Back or Forward button,
    // restore the page stored in that history entry.
    const handlePopState = (event) => {
      const historyTab = event.state?.causalLabTab;

      if (
        typeof historyTab === "string" &&
        menuItems.includes(historyTab)
      ) {
        setActiveTab(historyTab);
      } else {
        setActiveTab("Overview");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
    // The browser listener is installed once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check backend connection
  useEffect(() => {
    fetch(`${API_URL}/docs`)
      .then((response) => {
        setBackendMessage(
          response.ok ? "Connected" : "Connection failed"
        );
      })
      .catch(() => {
        setBackendMessage("Connection failed");
      });
  }, []);

  // Send requests to the backend
  const postRequest = async (endpoint, payload) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("The backend returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.message ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  };

  // =====================================================
  // SAMPLE SIZE CALCULATOR
  // =====================================================

  const calculateSampleSize = async (event) => {
    event.preventDefault();

    setError("");
    setSampleResult(null);

    const baseline = Number(baselineRate);
    const target = Number(targetRate);
    const significance = Number(alpha);
    const statisticalPower = Number(power);

    if (
      !Number.isFinite(baseline) ||
      !Number.isFinite(target) ||
      baseline <= 0 ||
      baseline >= 1 ||
      target <= 0 ||
      target >= 1
    ) {
      setError(
        "Conversion rates must be greater than 0 and less than 1."
      );
      return;
    }

    if (baseline === target) {
      setError(
        "Baseline and target conversion rates must be different."
      );
      return;
    }

    setLoading(true);

    try {
      const data = await postRequest("/sample-size", {
        baseline_rate: baseline,
        target_rate: target,
        alpha: significance,
        power: statisticalPower,
      });

      setSampleResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // A/B TESTING
  // =====================================================

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAbError("");
    setAbResult(null);
    setCsvFileName(file.name);

    try {
      const text = await file.text();

      const lines = text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");

      if (lines.length < 2) {
        throw new Error("The CSV file has no data rows.");
      }

      const headers = lines[0]
        .split(",")
        .map((header) => header.trim().toLowerCase());

      const groupIndex = headers.indexOf("group");
      const convertedIndex = headers.indexOf("converted");
      const revenueIndex = headers.indexOf("revenue");

      if (groupIndex === -1 || convertedIndex === -1) {
        throw new Error(
          "CSV must contain group and converted columns."
        );
      }

      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((value) => value.trim());

        return {
          group: values[groupIndex] || "",
          converted: values[convertedIndex] || "",
          revenue:
            revenueIndex === -1 ? "0" : values[revenueIndex] || "0",
        };
      });

      setAbRows(rows);
    } catch (err) {
      setAbError(err.message);
    }
  };

  const updateAbRow = (index, field, value) => {
    setAbRows((previousRows) =>
      previousRows.map((row, rowIndex) =>
        rowIndex === index
          ? { ...row, [field]: value }
          : row
      )
    );
  };

  const addAbRow = () => {
    setAbRows((previousRows) => [
      ...previousRows,
      {
        group: "A",
        converted: "0",
        revenue: "0",
      },
    ]);
  };

  const removeAbRow = (index) => {
    setAbRows((previousRows) =>
      previousRows.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const runAbTesting = async (event) => {
    event.preventDefault();

    setAbError("");
    setAbResult(null);

    if (abRows.length < 2) {
      setAbError("Please provide at least two data rows.");
      return;
    }

    const invalidRow = abRows.some((row) => {
      const converted = Number(row.converted);
      const revenue = Number(row.revenue);

      return (
        !["A", "B"].includes(row.group) ||
        !Number.isInteger(converted) ||
        ![0, 1].includes(converted) ||
        !Number.isFinite(revenue)
      );
    });

    if (invalidRow) {
      setAbError(
        "Check your data. Group must be A or B, converted must be 0 or 1, and revenue must be numeric."
      );
      return;
    }

    if (
      !abRows.some((row) => row.group === "A") ||
      !abRows.some((row) => row.group === "B")
    ) {
      setAbError("Both Group A and Group B must contain data.");
      return;
    }

    setAbLoading(true);

    try {
      const data = await postRequest("/ab-test", {
        data: abRows.map((row) => ({
          group: row.group,
          converted: Number(row.converted),
          revenue: Number(row.revenue),
        })),
      });

      setAbResult(data);
    } catch (err) {
      setAbError(err.message);
    } finally {
      setAbLoading(false);
    }
  };

  const renderAbTesting = () => (
    <section className="calculator-section">
      <div className="calculator-intro">
        <h2>A/B Testing Analysis</h2>
        <p>
          Compare Group A and Group B using conversion and revenue data.
          You can enter data manually or upload a CSV file.
        </p>
      </div>

      <div className="result-summary">
        <label htmlFor="csvUpload">Upload CSV File</label>
        <input
          id="csvUpload"
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
        />

        {csvFileName && <p>Selected file: {csvFileName}</p>}

        <p>
          Required CSV columns: group, converted. The revenue column is
          optional.
        </p>
      </div>

      <form onSubmit={runAbTesting}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Group</th>
                <th>Converted (0 or 1)</th>
                <th>Revenue</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {abRows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <select
                      value={row.group}
                      onChange={(event) =>
                        updateAbRow(index, "group", event.target.value)
                      }
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                    </select>
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="1"
                      value={row.converted}
                      onChange={(event) =>
                        updateAbRow(
                          index,
                          "converted",
                          event.target.value
                        )
                      }
                      required
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      step="any"
                      value={row.revenue}
                      onChange={(event) =>
                        updateAbRow(
                          index,
                          "revenue",
                          event.target.value
                        )
                      }
                      required
                    />
                  </td>

                  <td>
                    <button
                      type="button"
                      className="back-button"
                      onClick={() => removeAbRow(index)}
                      disabled={abRows.length <= 2}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="back-button"
            onClick={addAbRow}
          >
            + Add Row
          </button>

          <button
            type="submit"
            className="calculate-button"
            disabled={abLoading}
          >
            {abLoading ? "Analyzing..." : "Run A/B Test"}
          </button>
        </div>
      </form>

      {abError && (
        <div className="error-message" role="alert">
          <strong>A/B Testing Error</strong>
          <p>{abError}</p>
        </div>
      )}

      {abResult && (
        <div className="result-section">
          <h2>A/B Testing Results</h2>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {JSON.stringify(abResult, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );

  // =====================================================
  // MULTIPLE TESTING
  // =====================================================

  const runMultipleTesting = async (event) => {
    event.preventDefault();

    setMultipleError("");
    setMultipleResult(null);

    const values = pValuesInput
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map(Number);

    if (
      values.length === 0 ||
      values.some(
        (value) =>
          !Number.isFinite(value) || value < 0 || value > 1
      )
    ) {
      setMultipleError(
        "Enter valid p-values between 0 and 1, separated by commas."
      );
      return;
    }

    setMultipleLoading(true);

    try {
      const data = await postRequest("/multiple-testing", {
        p_values: values,
        alpha: Number(multipleAlpha),
      });

      setMultipleResult(data);
    } catch (err) {
      setMultipleError(err.message);
    } finally {
      setMultipleLoading(false);
    }
  };

  const renderMultipleTesting = () => (
    <section className="calculator-section">
      <div className="calculator-intro">
        <h2>Multiple Testing Correction</h2>
        <p>
          Apply statistical corrections when testing multiple hypotheses.
        </p>
      </div>

      <form
        className="calculator-form"
        onSubmit={runMultipleTesting}
      >
        <div className="form-field">
          <label htmlFor="pValues">P-values (comma-separated)</label>
          <textarea
            id="pValues"
            rows="3"
            value={pValuesInput}
            onChange={(event) => setPValuesInput(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="multipleAlpha">Significance Level</label>
          <select
            id="multipleAlpha"
            value={multipleAlpha}
            onChange={(event) => setMultipleAlpha(event.target.value)}
          >
            <option value="0.10">0.10 (10%)</option>
            <option value="0.05">0.05 (5%)</option>
            <option value="0.01">0.01 (1%)</option>
          </select>
        </div>

        <button
          type="submit"
          className="calculate-button"
          disabled={multipleLoading}
        >
          {multipleLoading ? "Calculating..." : "Correct P-values"}
        </button>
      </form>

      {multipleError && (
        <div className="error-message" role="alert">
          <strong>Multiple Testing Error</strong>
          <p>{multipleError}</p>
        </div>
      )}

      {multipleResult && (
        <div className="result-section">
          <h2>Multiple Testing Results</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {JSON.stringify(multipleResult, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );

  // =====================================================
  // SEQUENTIAL TESTING
  // =====================================================

  const updateSequentialLook = (index, field, value) => {
    setSequentialLooks((previousLooks) =>
      previousLooks.map((look, lookIndex) =>
        lookIndex === index
          ? { ...look, [field]: value }
          : look
      )
    );
  };

  const addSequentialLook = () => {
    setSequentialLooks((previousLooks) => [
      ...previousLooks,
      {
        conversions_a: "",
        total_a: "",
        conversions_b: "",
        total_b: "",
      },
    ]);
  };

  const removeSequentialLook = (index) => {
    setSequentialLooks((previousLooks) =>
      previousLooks.filter((_, lookIndex) => lookIndex !== index)
    );
  };

  const runSequentialTesting = async (event) => {
    event.preventDefault();

    setSequentialError("");
    setSequentialResult(null);

    const looks = sequentialLooks.map((look) => ({
      conversions_a: Number(look.conversions_a),
      total_a: Number(look.total_a),
      conversions_b: Number(look.conversions_b),
      total_b: Number(look.total_b),
    }));

    const invalid = looks.some(
      (look) =>
        !Object.values(look).every(Number.isInteger) ||
        look.total_a <= 0 ||
        look.total_b <= 0 ||
        look.conversions_a < 0 ||
        look.conversions_a > look.total_a ||
        look.conversions_b < 0 ||
        look.conversions_b > look.total_b
    );

    if (looks.length === 0 || invalid) {
      setSequentialError(
        "Enter valid whole numbers. Conversions must be between zero and the group total."
      );
      return;
    }

    setSequentialLoading(true);

    try {
      const data = await postRequest("/sequential-testing", {
        looks,
        alpha: Number(sequentialAlpha),
      });

      setSequentialResult(data);
    } catch (err) {
      setSequentialError(err.message);
    } finally {
      setSequentialLoading(false);
    }
  };

  const renderSequentialTesting = () => (
    <section className="calculator-section">
      <div className="calculator-intro">
        <h2>Sequential Testing</h2>
        <p>
          Monitor experiment results at planned checkpoints as data
          accumulates.
        </p>
      </div>

      <form onSubmit={runSequentialTesting}>
        {sequentialLooks.map((look, index) => (
          <div className="result-summary" key={index}>
            <h3>Checkpoint {index + 1}</h3>

            {[
              ["conversions_a", "Group A Conversions"],
              ["total_a", "Group A Total Users"],
              ["conversions_b", "Group B Conversions"],
              ["total_b", "Group B Total Users"],
            ].map(([field, label]) => (
              <div className="form-field" key={field}>
                <label htmlFor={`seq-${index}-${field}`}>
                  {label}
                </label>
                <input
                  id={`seq-${index}-${field}`}
                  type="number"
                  min="0"
                  step="1"
                  value={look[field]}
                  onChange={(event) =>
                    updateSequentialLook(
                      index,
                      field,
                      event.target.value
                    )
                  }
                  required
                />
              </div>
            ))}

            <button
              type="button"
              className="back-button"
              onClick={() => removeSequentialLook(index)}
              disabled={sequentialLooks.length <= 1}
            >
              Remove Checkpoint
            </button>
          </div>
        ))}

        <div className="form-field">
          <label htmlFor="sequentialAlpha">
            Significance Level
          </label>
          <select
            id="sequentialAlpha"
            value={sequentialAlpha}
            onChange={(event) =>
              setSequentialAlpha(event.target.value)
            }
          >
            <option value="0.10">10%</option>
            <option value="0.05">5%</option>
            <option value="0.01">1%</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="back-button"
            onClick={addSequentialLook}
          >
            + Add Checkpoint
          </button>

          <button
            type="submit"
            className="calculate-button"
            disabled={sequentialLoading}
          >
            {sequentialLoading ? "Analyzing..." : "Run Sequential Test"}
          </button>
        </div>
      </form>

      {sequentialError && (
        <div className="error-message" role="alert">
          <strong>Sequential Testing Error</strong>
          <p>{sequentialError}</p>
        </div>
      )}

      {sequentialResult && (
        <div className="result-section">
          <h2>Sequential Testing Results</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {JSON.stringify(sequentialResult, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );

  // =====================================================
  // CONFIDENCE INTERVALS
  // =====================================================

  const runConfidenceIntervals = async (event) => {
    event.preventDefault();

    setCiError("");
    setCiResult(null);

    const conversionsA = Number(ciConversionsA);
    const totalA = Number(ciTotalA);
    const conversionsB = Number(ciConversionsB);
    const totalB = Number(ciTotalB);
    const significance = Number(ciAlpha);

    if (
      ![
        conversionsA,
        totalA,
        conversionsB,
        totalB,
      ].every(Number.isInteger)
    ) {
      setCiError("All conversion counts and totals must be whole numbers.");
      return;
    }

    if (
      totalA <= 0 ||
      totalB <= 0 ||
      conversionsA < 0 ||
      conversionsA > totalA ||
      conversionsB < 0 ||
      conversionsB > totalB
    ) {
      setCiError(
        "Totals must be positive, and conversions must be within the group totals."
      );
      return;
    }

    if (
      !Number.isFinite(significance) ||
      significance <= 0 ||
      significance >= 1
    ) {
      setCiError("Alpha must be between 0 and 1.");
      return;
    }

    setCiLoading(true);

    try {
      const data = await postRequest("/confidence-interval", {
        conversions_a: conversionsA,
        total_a: totalA,
        conversions_b: conversionsB,
        total_b: totalB,
        alpha: significance,
      });

      setCiResult(data);
    } catch (err) {
      setCiError(err.message);
    } finally {
      setCiLoading(false);
    }
  };

  const renderConfidenceIntervals = () => (
    <section className="calculator-section">
      <div className="calculator-intro">
        <h2>Conversion Confidence Intervals</h2>
        <p>
          Calculate confidence intervals for each conversion rate
          and the difference between Group B and Group A.
        </p>
      </div>

      <div className="result-summary">
        <form
          className="calculator-form"
          onSubmit={runConfidenceIntervals}
        >
          {[
            [
              "ciConversionsA",
              "Group A conversions",
              ciConversionsA,
              setCiConversionsA,
              0,
            ],
            [
              "ciTotalA",
              "Group A total users",
              ciTotalA,
              setCiTotalA,
              1,
            ],
            [
              "ciConversionsB",
              "Group B conversions",
              ciConversionsB,
              setCiConversionsB,
              0,
            ],
            [
              "ciTotalB",
              "Group B total users",
              ciTotalB,
              setCiTotalB,
              1,
            ],
          ].map(([id, label, value, setter, minimum]) => (
            <div className="form-field" key={id}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                type="number"
                min={minimum}
                step="1"
                value={value}
                onChange={(event) => setter(event.target.value)}
                required
              />
            </div>
          ))}

          <div className="form-field">
            <label htmlFor="ciAlpha">Confidence level</label>
            <select
              id="ciAlpha"
              value={ciAlpha}
              onChange={(event) => setCiAlpha(event.target.value)}
            >
              <option value="0.10">90%</option>
              <option value="0.05">95%</option>
              <option value="0.01">99%</option>
            </select>
          </div>

          <button
            className="calculate-button"
            type="submit"
            disabled={ciLoading}
          >
            {ciLoading
              ? "Calculating..."
              : "Calculate Confidence Intervals"}
          </button>
        </form>
      </div>

      {ciError && (
        <div className="error-message" role="alert">
          <strong>Confidence Interval Error</strong>
          <p>{ciError}</p>
        </div>
      )}

      {ciResult && (
        <div className="result-section">
          <h2>Confidence Interval Results</h2>

          <div className="result-grid">
            <div className="result-card">
              <p>Group A Conversion Rate</p>
              <h3>
                {(
                  Number(ciResult.group_a?.conversion_rate) * 100
                ).toFixed(2)}
                %
              </h3>
              <span>
                Interval:{" "}
                {(
                  Number(ciResult.group_a?.lower_bound) * 100
                ).toFixed(2)}
                % –{" "}
                {(
                  Number(ciResult.group_a?.upper_bound) * 100
                ).toFixed(2)}
                %
              </span>
            </div>

            <div className="result-card result-highlight">
              <p>Group B Conversion Rate</p>
              <h3>
                {(
                  Number(ciResult.group_b?.conversion_rate) * 100
                ).toFixed(2)}
                %
              </h3>
              <span>
                Interval:{" "}
                {(
                  Number(ciResult.group_b?.lower_bound) * 100
                ).toFixed(2)}
                % –{" "}
                {(
                  Number(ciResult.group_b?.upper_bound) * 100
                ).toFixed(2)}
                %
              </span>
            </div>

            <div className="result-card">
              <p>Difference (B − A)</p>
              <h3>
                {(
                  Number(
                    ciResult.conversion_difference?.difference
                  ) * 100
                ).toFixed(2)}{" "}
                pp
              </h3>
              <span>
                Interval:{" "}
                {(
                  Number(
                    ciResult.conversion_difference?.lower_bound
                  ) * 100
                ).toFixed(2)}{" "}
                –{" "}
                {(
                  Number(
                    ciResult.conversion_difference?.upper_bound
                  ) * 100
                ).toFixed(2)}{" "}
                pp
              </span>
            </div>
          </div>

          <div className="result-summary">
            <h3>Interpretation</h3>
            <p>
              A confidence interval estimates a range of values compatible
              with the observed data. If the interval for the difference
              contains zero, the data do not clearly establish a difference
              at the corresponding two-sided significance level.
            </p>
          </div>
        </div>
      )}
    </section>
  );

  // =====================================================
  // BAYESIAN ANALYSIS
  // =====================================================

  const runBayesianAnalysis = async (event) => {
    event.preventDefault();

    setBayesError("");
    setBayesResult(null);

    const conversionsA = Number(bayesConversionsA);
    const totalA = Number(bayesTotalA);
    const conversionsB = Number(bayesConversionsB);
    const totalB = Number(bayesTotalB);
    const samples = Number(bayesSamples);
    const tune = Number(bayesTune);

    if (
      ![
        conversionsA,
        totalA,
        conversionsB,
        totalB,
        samples,
        tune,
      ].every(Number.isInteger)
    ) {
      setBayesError("All values must be whole numbers.");
      return;
    }

    if (
      totalA <= 0 ||
      totalB <= 0 ||
      conversionsA < 0 ||
      conversionsA > totalA ||
      conversionsB < 0 ||
      conversionsB > totalB ||
      samples <= 0 ||
      tune < 0
    ) {
      setBayesError("Please check all input values.");
      return;
    }

    setBayesLoading(true);

    try {
      const data = await postRequest("/bayesian-analysis", {
        conversions_a: conversionsA,
        total_a: totalA,
        conversions_b: conversionsB,
        total_b: totalB,
        samples,
        tune,
      });

      setBayesResult(data);
    } catch (err) {
      setBayesError(
        `Unable to run Bayesian analysis: ${err.message}. Check that PyMC is installed in the backend environment.`
      );
    } finally {
      setBayesLoading(false);
    }
  };

  const renderBayesianAnalysis = () => (
    <section className="calculator-section">
      <div className="calculator-intro">
        <h2>Bayesian A/B Analysis</h2>
        <p>
          Estimate each group's conversion rate and the probability
          that Group B performs better.
        </p>
      </div>

      <div className="result-summary">
        <form
          className="calculator-form"
          onSubmit={runBayesianAnalysis}
        >
          {[
            [
              "bayesConversionsA",
              "Group A conversions",
              bayesConversionsA,
              setBayesConversionsA,
            ],
            [
              "bayesTotalA",
              "Group A total users",
              bayesTotalA,
              setBayesTotalA,
            ],
            [
              "bayesConversionsB",
              "Group B conversions",
              bayesConversionsB,
              setBayesConversionsB,
            ],
            [
              "bayesTotalB",
              "Group B total users",
              bayesTotalB,
              setBayesTotalB,
            ],
            [
              "bayesSamples",
              "Posterior samples",
              bayesSamples,
              setBayesSamples,
            ],
            [
              "bayesTune",
              "Tuning steps",
              bayesTune,
              setBayesTune,
            ],
          ].map(([id, label, value, setter]) => (
            <div className="form-field" key={id}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                type="number"
                min={id === "bayesTune" ? "0" : "1"}
                step={id.includes("Samples") ? "100" : "1"}
                value={value}
                onChange={(event) => setter(event.target.value)}
                required
              />
            </div>
          ))}

          <button
            className="calculate-button"
            type="submit"
            disabled={bayesLoading}
          >
            {bayesLoading
              ? "Sampling... Please wait"
              : "Run Bayesian Analysis"}
          </button>
        </form>
      </div>

      {bayesError && (
        <div className="error-message" role="alert">
          <strong>Bayesian Analysis Error</strong>
          <p>{bayesError}</p>
        </div>
      )}

      {bayesResult && (
        <div className="result-section">
          <h2>Bayesian Results</h2>

          <div className="result-grid">
            <div className="result-card">
              <p>Group A Posterior Mean</p>
              <h3>
                {(
                  Number(bayesResult.group_a_conversion_rate) * 100
                ).toFixed(2)}
                %
              </h3>
            </div>

            <div className="result-card result-highlight">
              <p>Group B Posterior Mean</p>
              <h3>
                {(
                  Number(bayesResult.group_b_conversion_rate) * 100
                ).toFixed(2)}
                %
              </h3>
            </div>

            <div className="result-card">
              <p>Probability B Is Better</p>
              <h3>
                {(
                  Number(bayesResult.probability_b_better) * 100
                ).toFixed(2)}
                %
              </h3>
            </div>

            <div className="result-card">
              <p>Mean Difference (B − A)</p>
              <h3>
                {(
                  Number(bayesResult.conversion_difference) * 100
                ).toFixed(2)}{" "}
                pp
              </h3>
            </div>
          </div>

          <div className="result-summary">
            <h3>95% Credible Interval for B − A</h3>
            <p>
              {(
                Number(
                  bayesResult.difference_credible_interval_95?.[0]
                ) * 100
              ).toFixed(2)}
              {" to "}
              {(
                Number(
                  bayesResult.difference_credible_interval_95?.[1]
                ) * 100
              ).toFixed(2)}
              {" percentage points"}
            </p>
          </div>
        </div>
      )}
    </section>
  );

  // =====================================================
  // CAUSAL INFERENCE
  // =====================================================

  const runCausalAnalysis = async (event) => {
    event.preventDefault();

    setCausalError("");
    setCausalResult(null);

    let rows;

    try {
      rows = JSON.parse(causalData);
    } catch {
      setCausalError(
        "Enter valid JSON containing an array of data records."
      );
      return;
    }

    if (
      !Array.isArray(rows) ||
      rows.length < 2 ||
      rows.some(
        (row) =>
          row === null ||
          typeof row !== "object" ||
          Array.isArray(row)
      )
    ) {
      setCausalError(
        "Enter a JSON array containing at least two record objects."
      );
      return;
    }

    let endpoint;
    let payload;

    if (causalMethod === "difference-in-differences") {
      endpoint = "/difference-in-differences";

      payload = {
        data: rows,
        treatment_column: causalTreatmentColumn.trim(),
        time_column: causalTimeColumn.trim(),
        outcome_column: causalOutcomeColumn.trim(),
      };
    } else if (causalMethod === "propensity-matching") {
      endpoint = "/propensity-matching";

      payload = {
        data: rows,
        treatment_column: causalTreatmentColumn.trim(),
        outcome_column: causalOutcomeColumn.trim(),
        covariate_columns: causalCovariates
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      };
    } else {
      endpoint = "/synthetic-control";

      const interventionTime = Number(causalInterventionTime);

      if (!Number.isFinite(interventionTime)) {
        setCausalError("Intervention time must be numeric.");
        return;
      }

      payload = {
        data: rows,
        unit_column: causalUnitColumn.trim(),
        time_column: causalTimeSeriesColumn.trim(),
        treatment_column: causalTreatmentColumn.trim(),
        outcome_column: causalOutcomeColumn.trim(),
        treated_unit: causalTreatedUnit.trim(),
        intervention_time: interventionTime,
      };
    }

    setCausalLoading(true);

    try {
      const data = await postRequest(endpoint, payload);
      setCausalResult(data);
    } catch (err) {
      setCausalError(
        `Unable to run causal analysis: ${err.message}. Check the expected request fields in backend/main.py.`
      );
    } finally {
      setCausalLoading(false);
    }
  };

  const renderCausalInference = () => (
    <section className="calculator-section">
      <div className="calculator-intro">
        <h2>Causal Inference Methods</h2>
        <p>
          Select a method and provide data as a JSON array.
          The column names must match the keys in your data.
        </p>
      </div>

      <div className="result-summary">
        <form onSubmit={runCausalAnalysis}>
          <div className="form-field">
            <label htmlFor="causalMethod">Causal Method</label>

            <select
              id="causalMethod"
              value={causalMethod}
              onChange={(event) => {
                setCausalMethod(event.target.value);
                setCausalResult(null);
                setCausalError("");
              }}
            >
              <option value="difference-in-differences">
                Difference-in-Differences
              </option>
              <option value="propensity-matching">
                Propensity Score Matching
              </option>
              <option value="synthetic-control">
                Synthetic Control
              </option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="causalData">Dataset (JSON array)</label>

            <textarea
              id="causalData"
              rows="12"
              value={causalData}
              onChange={(event) => setCausalData(event.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                boxSizing: "border-box",
                fontFamily: "monospace",
              }}
            />

            <small>
              The default sample data is illustrative. Replace it with
              suitable data before drawing conclusions.
            </small>
          </div>

          <div className="form-field">
            <label htmlFor="causalTreatmentColumn">
              Treatment Column
            </label>
            <input
              id="causalTreatmentColumn"
              value={causalTreatmentColumn}
              onChange={(event) =>
                setCausalTreatmentColumn(event.target.value)
              }
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="causalOutcomeColumn">
              Outcome Column
            </label>
            <input
              id="causalOutcomeColumn"
              value={causalOutcomeColumn}
              onChange={(event) =>
                setCausalOutcomeColumn(event.target.value)
              }
              required
            />
          </div>

          {causalMethod === "difference-in-differences" && (
            <div className="form-field">
              <label htmlFor="causalTimeColumn">
                Pre/Post Indicator Column (0 = before, 1 = after)
              </label>
              <input
                id="causalTimeColumn"
                value={causalTimeColumn}
                onChange={(event) =>
                  setCausalTimeColumn(event.target.value)
                }
                required
              />
            </div>
          )}

          {causalMethod === "propensity-matching" && (
            <div className="form-field">
              <label htmlFor="causalCovariates">
                Covariate Columns (comma-separated)
              </label>
              <input
                id="causalCovariates"
                value={causalCovariates}
                onChange={(event) =>
                  setCausalCovariates(event.target.value)
                }
                required
              />
              <small>
                Use relevant pre-treatment variables, such as age or income.
              </small>
            </div>
          )}

          {causalMethod === "synthetic-control" && (
            <>
              <div className="form-field">
                <label htmlFor="causalUnitColumn">Unit Column</label>
                <input
                  id="causalUnitColumn"
                  value={causalUnitColumn}
                  onChange={(event) =>
                    setCausalUnitColumn(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="causalTimeSeriesColumn">
                  Time-Period Column
                </label>
                <input
                  id="causalTimeSeriesColumn"
                  value={causalTimeSeriesColumn}
                  onChange={(event) =>
                    setCausalTimeSeriesColumn(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="causalTreatedUnit">
                  Treated Unit Value
                </label>
                <input
                  id="causalTreatedUnit"
                  value={causalTreatedUnit}
                  onChange={(event) =>
                    setCausalTreatedUnit(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="causalInterventionTime">
                  Intervention Time
                </label>
                <input
                  id="causalInterventionTime"
                  type="number"
                  value={causalInterventionTime}
                  onChange={(event) =>
                    setCausalInterventionTime(event.target.value)
                  }
                  required
                />
              </div>
            </>
          )}

          <button
            className="calculate-button"
            type="submit"
            disabled={causalLoading}
          >
            {causalLoading ? "Analyzing..." : "Run Causal Analysis"}
          </button>
        </form>
      </div>

      {causalError && (
        <div className="error-message" role="alert">
          <strong>Causal Analysis Error</strong>
          <p>{causalError}</p>
        </div>
      )}

      {causalResult && (
        <div className="result-section">
          <h2>Causal Analysis Results</h2>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {JSON.stringify(causalResult, null, 2)}
          </pre>

          <p className="result-description">
            Causal estimates depend on assumptions and data quality.
            Difference-in-Differences commonly requires parallel trends.
            Matching requires adequate overlap and measured confounders.
            Synthetic Control requires a suitable donor pool and
            good pre-intervention fit.
          </p>
        </div>
      )}
    </section>
  );

  // =====================================================
  // NAVIGATION
  // =====================================================

  const openTool = (title) => {
    if (!menuItems.includes(title)) {
      return;
    }

    // Create a new browser history entry whenever the user
    // navigates to another page inside the application.
    if (title !== activeTab) {
      window.history.pushState(
        {
          ...(window.history.state || {}),
          causalLabTab: title,
        },
        "",
        window.location.href
      );

      setActiveTab(title);
    }

    setError("");
    setAbError("");
    setMultipleError("");
    setSequentialError("");
    setCiError("");
    setBayesError("");
    setCausalError("");
  };

  // =====================================================
  // SAMPLE SIZE PAGE
  // =====================================================

  const renderSampleSizeCalculator = () => (
    <section className="calculator-section">
      <div className="calculator-intro">
        <h2>Sample Size Calculator</h2>
        <p>
          Estimate the number of users needed in each group for your A/B test.
          Enter conversion rates as decimals: 0.10 means 10%.
        </p>
      </div>

      <form
        className="calculator-form"
        onSubmit={calculateSampleSize}
      >
        <div className="form-field">
          <label htmlFor="baselineRate">
            Baseline Conversion Rate
          </label>
          <input
            id="baselineRate"
            type="number"
            min="0.0001"
            max="0.9999"
            step="any"
            value={baselineRate}
            onChange={(event) => setBaselineRate(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="targetRate">Target Conversion Rate</label>
          <input
            id="targetRate"
            type="number"
            min="0.0001"
            max="0.9999"
            step="any"
            value={targetRate}
            onChange={(event) => setTargetRate(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="alpha">Significance Level (Alpha)</label>
          <select
            id="alpha"
            value={alpha}
            onChange={(event) => setAlpha(event.target.value)}
          >
            <option value="0.10">0.10 (10%)</option>
            <option value="0.05">0.05 (5%)</option>
            <option value="0.01">0.01 (1%)</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="power">Statistical Power</label>
          <select
            id="power"
            value={power}
            onChange={(event) => setPower(event.target.value)}
          >
            <option value="0.70">0.70 (70%)</option>
            <option value="0.80">0.80 (80%)</option>
            <option value="0.90">0.90 (90%)</option>
            <option value="0.95">0.95 (95%)</option>
          </select>
        </div>

        <button
          className="calculate-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate Required Sample Size"}
        </button>
      </form>

      {error && (
        <div className="error-message" role="alert">
          <strong>Calculation Error</strong>
          <p>{error}</p>
        </div>
      )}

      {sampleResult && (
        <div className="result-section">
          <h2>Sample Size Results</h2>

          <div className="result-grid">
            <div className="result-card">
              <p>Sample Size Per Group</p>
              <h3>
                {Number(
                  sampleResult.sample_size_per_group
                ).toLocaleString()}
              </h3>
            </div>

            <div className="result-card result-highlight">
              <p>Total Sample Size</p>
              <h3>
                {Number(
                  sampleResult.total_sample_size
                ).toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="result-summary">
            <p>
              Baseline rate:{" "}
              {(Number(sampleResult.baseline_rate) * 100).toFixed(1)}%
            </p>
            <p>
              Target rate:{" "}
              {(Number(sampleResult.target_rate) * 100).toFixed(1)}%
            </p>
            <p>
              Significance level:{" "}
              {(Number(sampleResult.alpha) * 100).toFixed(1)}%
            </p>
            <p>
              Statistical power:{" "}
              {(Number(sampleResult.power) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      )}
    </section>
  );

  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2 className="logo">CausalLab</h2>
        <p className="sidebar-label">ANALYTICS PLATFORM</p>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={`menu-item ${
                activeTab === item ? "active" : ""
              }`}
              onClick={() => openTool(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>Experimentation Platform</p>
          <small>Version 1.0</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Analytics / {activeTab}</p>
            <h1>{activeTab}</h1>
          </div>

          <div className="status-badge">
            <span
              className={`status-dot ${
                backendMessage === "Connected"
                  ? "connected"
                  : backendMessage === "Connection failed"
                  ? "disconnected"
                  : "checking"
              }`}
            />

            <span>Backend: {backendMessage}</span>
          </div>
        </header>

        {activeTab === "Overview" ? (
          <>
            <section className="welcome-section">
              <div className="welcome-content">
                <p className="welcome-label">WELCOME TO CAUSALLAB</p>
                <h2>Experimentation &amp; Causal Inference</h2>
                <p>
                  Design experiments, analyze results, and estimate the
                  impact of interventions using statistical methods and
                  causal inference techniques.
                </p>
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <p>Total Experiments</p>
                <h2>12</h2>
                <span>Example dashboard metric</span>
              </div>

              <div className="stat-card">
                <p>Completed Analyses</p>
                <h2>8</h2>
                <span>Example dashboard metric</span>
              </div>

              <div className="stat-card">
                <p>Statistical Methods</p>
                <h2>6+</h2>
                <span>Methods available in the project</span>
              </div>

              <div className="stat-card">
                <p>Backend Status</p>
                <h2
                  className={
                    backendMessage === "Connected"
                      ? "backend-status"
                      : "backend-pending"
                  }
                >
                  {backendMessage === "Connected"
                    ? "Ready"
                    : backendMessage === "Connection failed"
                    ? "Offline"
                    : "Checking"}
                </h2>
                <span>FastAPI connection status</span>
              </div>
            </section>

            <section className="section-heading">
              <div>
                <h2>Analysis Tools</h2>
                <p>
                  Select an analysis method to explore the platform.
                </p>
              </div>
            </section>

            <section className="tools-grid">
              {tools.map((tool) => (
                <article className="tool-card" key={tool.title}>
                  <div className="tool-icon">{tool.icon}</div>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>

                  <button
                    type="button"
                    className="tool-button"
                    onClick={() => openTool(tool.title)}
                  >
                    {tool.button} <span>→</span>
                  </button>
                </article>
              ))}
            </section>
          </>
        ) : activeTab === "Sample Size Calculator" ? (
          renderSampleSizeCalculator()
        ) : activeTab === "A/B Testing" ? (
          renderAbTesting()
        ) : activeTab === "Multiple Testing" ? (
          renderMultipleTesting()
        ) : activeTab === "Sequential Testing" ? (
          renderSequentialTesting()
        ) : activeTab === "Confidence Intervals" ? (
          renderConfidenceIntervals()
        ) : activeTab === "Bayesian Analysis" ? (
          renderBayesianAnalysis()
        ) : activeTab === "Causal Inference" ? (
          renderCausalInference()
        ) : (
          <section className="info-panel">
            <h2>{activeTab}</h2>
            <p>Select an analysis tool from the sidebar.</p>

            <button
              type="button"
              className="back-button"
              onClick={() => openTool("Overview")}
            >
              ← Back to Overview
            </button>
          </section>
        )}

        <footer className="page-footer">
          <p>
            CausalLab · Experimentation and Causal Inference Platform
          </p>
          <span>Educational Demo</span>
        </footer>
      </main>
    </div>
  );
}

export default App;