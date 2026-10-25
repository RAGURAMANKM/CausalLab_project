import numpy as np
import pandas as pd

from backend.propensity_matching import perform_propensity_score_matching


# Create reproducible simulated customer data
np.random.seed(42)

number_of_customers = 1000

age = np.random.randint(18, 65, number_of_customers)
income = np.random.randint(15000, 100000, number_of_customers)

# Estimate each customer's probability of receiving treatment
treatment_probability = 1 / (
    1 + np.exp(
        -(age - 40) / 10
        -(income - 57500) / 30000
    )
)

# Assign customers to treatment or control groups
treatment = np.random.binomial(
    1,
    treatment_probability
)

# Generate customer spending outcomes
spending = (
    500
    + age * 5
    + income * 0.01
    + treatment * 200
    + np.random.normal(0, 100, number_of_customers)
)

# Create the DataFrame
data = pd.DataFrame({
    "age": age,
    "income": income,
    "treatment": treatment,
    "spending": spending
})

# Run Propensity Score Matching
result = perform_propensity_score_matching(
    data=data,
    treatment_column="treatment",
    outcome_column="spending",
    covariate_columns=["age", "income"]
)

# Display the results
print("\nPROPENSITY SCORE MATCHING RESULTS")
print("=" * 45)

for key, value in result.items():
    print(f"{key}: {value}")