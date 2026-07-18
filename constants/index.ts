export type VersionStatus = "Draft" | "Active" | "Superseded" | "Withdrawn";

export type GuidelineType = "Compendium" | "Interim";

export type GuidelineVersion = {
    version: string;
    status: VersionStatus;
};

export type Guideline = {
    id: string;
    title: string;
    topic: string[];
    societies: string[];
    type: GuidelineType;
    versions: GuidelineVersion[];
    updatedAt: string;
    isParallel?: boolean;
}

export const guidelines: Guideline[] = [
    {
        id: "cap-children",
        title: "Community-acquired pneumonia in children",
        topic: ["Infectious disease", "Pulmonology"],
        societies: ["PIDS", "IDSA"],
        type: "Compendium",
        versions: [
            { version: "v3.0", status: "Draft" },
            { version: "v2.1", status: "Active" },
            { version: "v2.0", status: "Superseded" },
            { version: "v1.2", status: "Superseded" },
        ],
        updatedAt: "12 min ago",
    },
    {
        id: "neonatal-eos-sepsis",
        title: "Neonatal early-onset sepsis: risk stratification",
        topic: ["Neonatology", "Infectious disease"],
        societies: ["AAP"],
        type: "Interim",
        versions: [
            { version: "v2.0", status: "Draft" },
            { version: "v1.2", status: "Active" },
            { version: "v1.0", status: "Superseded" },
        ],
        updatedAt: "2 hours ago",
    },
    {
        id: "uti-infants",
        title: "Urinary tract infection in infants 2–24 months",
        topic: ["Infectious disease", "Nephrology"],
        societies: ["AAP", "ESPID"],
        type: "Compendium",
        versions: [
            { version: "v2.0", status: "Draft" },
            { version: "v1.1", status: "Active" },
        ],
        updatedAt: "yesterday",
    },
    {
        id: "asthma-ed",
        title: "Acute asthma exacerbation in the emergency department",
        topic: ["Pulmonology", "Emergency medicine"],
        societies: ["GINA", "AAP"],
        type: "Compendium",
        versions: [
            { version: "v4.0", status: "Active" },
            { version: "v3.2", status: "Superseded" },
        ],
        updatedAt: "3 weeks ago",
    },
    {
        id: "bronchiolitis-infants",
        title: "Bronchiolitis in infants under 24 months",
        topic: ["Pulmonology"],
        societies: ["AAP"],
        type: "Compendium",
        versions: [
            { version: "v2.0", status: "Active" },
            { version: "v2.0", status: "Active" },
            { version: "v1.3", status: "Superseded" },
        ],
        updatedAt: "5 days ago",
        isParallel: true,
    },
    {
        id: "febrile-seizures",
        title: "Simple febrile seizures in children 6–60 months",
        topic: ["Neurology"],
        societies: ["AAP"],
        type: "Interim",
        versions: [
            { version: "v1.4", status: "Active" },
            { version: "v1.3", status: "Withdrawn" },
        ],
        updatedAt: "2 months ago",
    },
    {
        id: "kawasaki-disease",
        title: "Diagnosis and management of Kawasaki disease",
        topic: ["Cardiology", "Infectious disease", "Rheumatology"],
        societies: ["AHA", "AAP"],
        type: "Compendium",
        versions: [
            { version: "v3.1", status: "Active" },
            { version: "v3.0", status: "Superseded" },
            { version: "v2.0", status: "Superseded" },
        ],
        updatedAt: "1 week ago",
    },
    {
        id: "dka-pediatric",
        title: "Diabetic ketoacidosis management in children",
        topic: ["Endocrinology", "Emergency medicine"],
        societies: ["ISPAD", "AAP"],
        type: "Compendium",
        versions: [
            { version: "v2.2", status: "Active" },
            { version: "v2.1", status: "Superseded" },
        ],
        updatedAt: "4 days ago",
    },
    {
        id: "atopic-dermatitis",
        title: "Atopic dermatitis management in children and adolescents",
        topic: ["Dermatology", "Allergy/Immunology"],
        societies: ["AAD"],
        type: "Interim",
        versions: [
            { version: "v1.0", status: "Draft" },
        ],
        updatedAt: "10 hours ago",
    },
    {
        id: "adhd-diagnosis",
        title: "ADHD diagnosis and treatment in children and adolescents",
        topic: ["Neurology", "Psychiatry"],
        societies: ["AAP"],
        type: "Compendium",
        versions: [
            { version: "v2.0", status: "Active" },
            { version: "v1.5", status: "Superseded" },
            { version: "v1.0", status: "Withdrawn" },
        ],
        updatedAt: "6 weeks ago",
    },
    {
        id: "constipation-pediatric",
        title: "Functional constipation in infants and children",
        topic: ["Gastroenterology"],
        societies: ["NASPGHAN", "ESPGHAN"],
        type: "Compendium",
        versions: [
            { version: "v1.3", status: "Active" },
            { version: "v1.2", status: "Superseded" },
        ],
        updatedAt: "2 weeks ago",
    },
    {
        id: "anaphylaxis-management",
        title: "Recognition and management of anaphylaxis",
        topic: ["Allergy/Immunology", "Emergency medicine"],
        societies: ["AAAAI", "ACAAI"],
        type: "Compendium",
        versions: [
            { version: "v2.0", status: "Active" },
            { version: "v2.0", status: "Active" },
            { version: "v1.4", status: "Superseded" },
        ],
        updatedAt: "3 days ago",
        isParallel: true,
    },
    {
        id: "iron-deficiency-anemia",
        title: "Screening and treatment of iron deficiency anemia in infants",
        topic: ["Hematology", "Nutrition"],
        societies: ["AAP"],
        type: "Interim",
        versions: [
            { version: "v1.1", status: "Active" },
            { version: "v1.0", status: "Superseded" },
        ],
        updatedAt: "1 month ago",
    },
    {
        id: "otitis-media",
        title: "Diagnosis and management of acute otitis media",
        topic: ["Otolaryngology", "Infectious disease"],
        societies: ["AAP", "AAFP"],
        type: "Compendium",
        versions: [
            { version: "v3.0", status: "Draft" },
            { version: "v2.3", status: "Active" },
            { version: "v2.2", status: "Superseded" },
            { version: "v2.0", status: "Superseded" },
        ],
        updatedAt: "8 days ago",
    },
    {
        id: "neonatal-hyperbilirubinemia",
        title: "Management of hyperbilirubinemia in the newborn",
        topic: ["Neonatology", "Hepatology"],
        societies: ["AAP"],
        type: "Compendium",
        versions: [
            { version: "v2.1", status: "Active" },
            { version: "v2.0", status: "Superseded" },
            { version: "v1.0", status: "Superseded" },
        ],
        updatedAt: "5 weeks ago",
    },
    {
        id: "juvenile-idiopathic-arthritis",
        title: "Treatment recommendations for juvenile idiopathic arthritis",
        topic: ["Rheumatology"],
        societies: ["ACR", "CARRA"],
        type: "Interim",
        versions: [
            { version: "v1.0", status: "Draft" },
        ],
        updatedAt: "1 day ago",
    },
];