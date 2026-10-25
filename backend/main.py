from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import pandas as pd

from backend.statistics import analyze_ab_test
from backend.power_calculator import calculate_sample_size
from backend.multiple_testing import correct_p_values
from backend.synthetic_control import analyze_synthetic_control

from backend.confidence_intervals import (
    calculate_conversion_confidence_interval,
    calculate_conversion_difference_ci
)

from backend.bayesian_analysis import analyze_bayesian_ab_test

from backend.propensity_matching import (
    perform_propensity_score_matching
)

from backend.difference_in_differences import (
    analyze_difference_in_differences
)

from backend.sequential_testing import analyze_sequential_test


# --------------------------------------------------
# Create FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Experimentation and Causal Inference Platform",
    description="A platform for experiment analysis and causal inference",
    version="1.0.0"
)


# --------------------------------------------------
# Enable frontend connection
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request models
# --------------------------------------------------

class ABTestRequest(BaseModel):
    data: list[dict]


class MultipleTestingRequest(BaseModel):
    p_values: list[float] = Field(min_length=1)
    alpha: float = Field(default=0.05, gt=0, lt=1)


class ConfidenceIntervalRequest(BaseModel):
    conversions_a: int = Field(ge=0)
    total_a: int = Field(gt=0)
    conversions_b: int = Field(ge=0)
    total_b: int = Field(gt=0)
    alpha: float = Field(default=0.05, gt=0, lt=1)


# --------------------------------------------------
# Sequential Testing request models
# --------------------------------------------------

class SequentialLook(BaseModel):
    conversions_a: int = Field(ge=0)
    total_a: int = Field(gt=0)

    conversions_b: int = Field(ge=0)
    total_b: int = Field(gt=0)


class SequentialTestingRequest(BaseModel):
    looks: list[SequentialLook] = Field(min_length=1)
    alpha: float = Field(default=0.05, gt=0, lt=1)


class BayesianAnalysisRequest(BaseModel):
    conversions_a: int = Field(ge=0)
    total_a: int = Field(gt=0)
    conversions_b: int = Field(ge=0)
    total_b: int = Field(gt=0)
    samples: int = Field(default=2000, gt=0)
    tune: int = Field(default=1000, ge=0)


class PropensityMatchingRequest(BaseModel):
    data: list[dict]
    treatment_column: str
    outcome_column: str
    covariate_columns: list[str]


class DifferenceInDifferencesRequest(BaseModel):
    data: list[dict]
    treatment_column: str
    time_column: str
    outcome_column: str


class SyntheticControlRequest(BaseModel):
    data: list[dict]
    unit_column: str
    time_column: str
    outcome_column: str
    treated_unit: str
    intervention_time: float


# --------------------------------------------------
# Home endpoint
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": (
            "Welcome to the Experimentation and "
            "Causal Inference Platform"
        ),
        "status": "Application is running successfully"
    }


# --------------------------------------------------
# Sample size calculator
# --------------------------------------------------

@app.get("/sample-size")
def sample_size(
    baseline_rate: float = Query(0.10, gt=0, lt=1),
    target_rate: float = Query(0.13, gt=0, lt=1),
    alpha: float = Query(0.05, gt=0, lt=1),
    power: float = Query(0.80, gt=0, lt=1)
):
    try:
        return calculate_sample_size(
            baseline_rate=baseline_rate,
            target_rate=target_rate,
            alpha=alpha,
            power=power
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# --------------------------------------------------
# Multiple testing correction
# --------------------------------------------------

@app.post("/multiple-testing")
def multiple_testing_analysis(
    request: MultipleTestingRequest
):
    try:
        results = correct_p_values(
            request.p_values,
            alpha=request.alpha
        )

        return {
            "alpha": request.alpha,
            "number_of_tests": len(request.p_values),
            "results": results
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# --------------------------------------------------
# Confidence interval analysis
# --------------------------------------------------

@app.post("/confidence-interval")
def confidence_interval_analysis(
    request: ConfidenceIntervalRequest
):
    try:
        group_a = calculate_conversion_confidence_interval(
            conversions=request.conversions_a,
            total_users=request.total_a,
            alpha=request.alpha
        )

        group_b = calculate_conversion_confidence_interval(
            conversions=request.conversions_b,
            total_users=request.total_b,
            alpha=request.alpha
        )

        difference = calculate_conversion_difference_ci(
            conversions_a=request.conversions_a,
            total_a=request.total_a,
            conversions_b=request.conversions_b,
            total_b=request.total_b,
            alpha=request.alpha
        )

        return {
            "confidence_level": 1 - request.alpha,
            "group_a": group_a,
            "group_b": group_b,
            "conversion_difference": difference
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# --------------------------------------------------
# Sequential testing
# --------------------------------------------------

@app.post("/sequential-testing")
def sequential_testing_analysis(
    request: SequentialTestingRequest
):
    try:
        # Convert request models into dictionaries
        looks_data = [
            look.model_dump()
            for look in request.looks
        ]

        # Perform sequential analysis
        result = analyze_sequential_test(
            looks=looks_data,
            alpha=request.alpha
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# --------------------------------------------------
# Bayesian A/B test analysis
# --------------------------------------------------

@app.post("/bayesian-analysis")
def bayesian_analysis(
    request: BayesianAnalysisRequest
):
    try:
        result = analyze_bayesian_ab_test(
            conversions_a=request.conversions_a,
            total_a=request.total_a,
            conversions_b=request.conversions_b,
            total_b=request.total_b,
            samples=request.samples,
            tune=request.tune
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# --------------------------------------------------
# Propensity score matching
# --------------------------------------------------

@app.post("/propensity-matching")
def propensity_matching_analysis(
    request: PropensityMatchingRequest
):
    try:
        data = pd.DataFrame(request.data)

        result = perform_propensity_score_matching(
            data=data,
            treatment_column=request.treatment_column,
            outcome_column=request.outcome_column,
            covariate_columns=request.covariate_columns
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# --------------------------------------------------
# Difference-in-differences analysis
# --------------------------------------------------

@app.post("/difference-in-differences")
def difference_in_differences_analysis(
    request: DifferenceInDifferencesRequest
):
    try:
        data = pd.DataFrame(request.data)

        result = analyze_difference_in_differences(
            data=data,
            treatment_column=request.treatment_column,
            time_column=request.time_column,
            outcome_column=request.outcome_column
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# --------------------------------------------------
# Synthetic control analysis
# --------------------------------------------------

@app.post("/synthetic-control")
def synthetic_control_analysis(
    request: SyntheticControlRequest
):
    try:
        data = pd.DataFrame(request.data)

        result = analyze_synthetic_control(
            data=data,
            unit_column=request.unit_column,
            time_column=request.time_column,
            outcome_column=request.outcome_column,
            treated_unit=request.treated_unit,
            intervention_time=request.intervention_time
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# --------------------------------------------------
# A/B test analysis
# --------------------------------------------------

@app.post("/analyze-ab-test")
def ab_test_analysis(
    request: ABTestRequest
):
    try:
        data = pd.DataFrame(request.data)

        results = analyze_ab_test(data)

        return results

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )