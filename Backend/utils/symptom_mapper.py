"""
Symptom Mapper

Maps patient symptoms to the most appropriate hospital department.
"""

SYMPTOM_DEPARTMENT_MAP = {
    # Cardiology
    "chest pain": "Cardiology",
    "heart pain": "Cardiology",
    "palpitations": "Cardiology",
    "high blood pressure": "Cardiology",

    # Neurology
    "headache": "Neurology",
    "migraine": "Neurology",
    "dizziness": "Neurology",
    "seizure": "Neurology",

    # Orthopedics
    "bone pain": "Orthopedics",
    "joint pain": "Orthopedics",
    "back pain": "Orthopedics",
    "fracture": "Orthopedics",
    "leg pain": "Orthopedics",
    "shoulder pain": "Orthopedics",

    # Dermatology
    "skin rash": "Dermatology",
    "itching": "Dermatology",
    "acne": "Dermatology",
    "eczema": "Dermatology",

    # General Medicine
    "fever": "General Medicine",
    "cold": "General Medicine",
    "cough": "General Medicine",
    "vomiting": "General Medicine",
    "stomach pain": "General Medicine",
    "weakness": "General Medicine",

    # ENT
    "ear pain": "ENT",
    "sore throat": "ENT",
    "nose bleed": "ENT",

    # Ophthalmology
    "eye pain": "Ophthalmology",
    "blurred vision": "Ophthalmology",
    "red eyes": "Ophthalmology",

    # Dental
    "tooth pain": "Dental",
    "gum bleeding": "Dental"
}


def get_department(symptoms: str) -> str:
    """
    Return the department for given symptoms.
    Defaults to General Medicine if no match is found.
    """

    if not symptoms:
        return "General Medicine"

    symptoms = symptoms.lower()

    for keyword, department in SYMPTOM_DEPARTMENT_MAP.items():
        if keyword in symptoms:
            return department

    return "General Medicine"