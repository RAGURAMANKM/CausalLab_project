import numpy as np
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors


def perform_propensity_score_matching(
    data,
    treatment_column,
    outcome_column,
    covariate_columns
):
    # Check required columns
    required_columns = [
        treatment_column,
        outcome_column
    ] + covariate_columns

    for column in required_columns:
        if column not in data.columns:
            raise ValueError(f"Missing required column: {column}")

    # Keep only the required columns and remove missing values
    df = data[required_columns].dropna().copy()

    # Check treatment values
    if not set(df[treatment_column].unique()).issubset({0, 1}):
        raise ValueError("Treatment column must contain only 0 and 1.")

    # Ensure both groups exist
    if df[treatment_column].nunique() != 2:
        raise ValueError("Both treatment and control groups are required.")

    # Separate treatment and outcome
    treatment = df[treatment_column].astype(int)
    outcome = pd.to_numeric(df[outcome_column], errors="raise")

    # Convert categorical covariates into numeric columns
    covariates = pd.get_dummies(
        df[covariate_columns],
        drop_first=True,
        dtype=float
    )

    # Scale covariates
    scaler = StandardScaler()
    scaled_covariates = scaler.fit_transform(covariates)

    # Estimate propensity scores using logistic regression
    model = LogisticRegression(max_iter=1000)
    model.fit(scaled_covariates, treatment)

    propensity_scores = model.predict_proba(
        scaled_covariates
    )[:, 1]

    # Separate treatment and control groups
    treated_mask = treatment == 1
    control_mask = treatment == 0

    treated_scores = propensity_scores[treated_mask.to_numpy()]
    control_scores = propensity_scores[control_mask.to_numpy()]

    treated_outcomes = outcome[treated_mask].to_numpy()
    control_outcomes = outcome[control_mask].to_numpy()

    # Match each treated subject to the nearest control
    matcher = NearestNeighbors(n_neighbors=1)
    matcher.fit(control_scores.reshape(-1, 1))

    distances, indices = matcher.kneighbors(
        treated_scores.reshape(-1, 1)
    )

    matched_control_outcomes = control_outcomes[indices.flatten()]

    # Calculate the estimated treatment effect
    treatment_effect = np.mean(
        treated_outcomes - matched_control_outcomes
    )

    return {
        "total_rows_used": int(len(df)),
        "treated_count": int(treated_mask.sum()),
        "control_count": int(control_mask.sum()),
        "matched_pairs": int(len(treated_outcomes)),
        "average_treatment_effect_on_treated": float(treatment_effect),
        "mean_propensity_score_treated": float(np.mean(treated_scores)),
        "mean_propensity_score_control": float(np.mean(control_scores))
    }