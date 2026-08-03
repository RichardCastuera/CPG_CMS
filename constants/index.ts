export type VersionStatus = "draft" | "in_review" | "published" | "superseded";

export type GuidelineStatus = "draft" | "in_review" | "published" | "archived";

export type GuidelineType = "Compendium" | "Interim";

export type GuidelineVersion = {
    id: string;
    guideline_id: string;
    version_number: string;
    status: VersionStatus;
    changelog: string | null;
    effective_date: string | null;
    source_pdf_url: string | null;
    created_by: string | null;
    created_at: string;
    published_at: string | null;
}

export type Author = {
  name: string;
  affiliation?: string;
  position: string;
};

export type Guideline = {
    id: string;
    title: string;
    short_title: string | null;
    guideline_type: GuidelineType;
    specialty_tags: string[];
    societies: string[];
    authors: Author[];
    doi: string | null;
    status: GuidelineStatus;
    source: "authored" | "imported";
    current_version_id: string | null;
    next_review_date: string | null;
    created_at: string;
    updated_at: string;
}

// For UI convenience: a guideline row joined with all its versions
export type GuidelineWithVersions = Guideline & {
    versions: GuidelineVersion[];
}

export const guidelines: GuidelineWithVersions[] = [
    {
        id: "cap-children",
        title: "Community-acquired pneumonia in children",
        short_title: "CAP in children",
        guideline_type: "Compendium",
        specialty_tags: ["Infectious disease", "Pulmonology"],
        societies: ["PIDS", "IDSA"],
        authors: [],
        doi: null,
        source: "authored",
        status: "published",
        current_version_id: "v-cap-2",
        next_review_date: null,
        created_at: "2025-01-10T00:00:00Z",
        updated_at: "2026-07-18T00:00:00Z",
        versions: [
            { id: "v-cap-4", guideline_id: "cap-children", version_number: "v3.0", status: "draft", changelog: null, effective_date: null, source_pdf_url: null, created_by: null, created_at: "2026-07-18T00:00:00Z", published_at: null },
            { id: "v-cap-3", guideline_id: "cap-children", version_number: "v2.1", status: "published", changelog: null, effective_date: "2026-01-01", source_pdf_url: null, created_by: null, created_at: "2025-12-01T00:00:00Z", published_at: "2026-01-01T00:00:00Z" },
            { id: "v-cap-2", guideline_id: "cap-children", version_number: "v2.0", status: "superseded", changelog: null, effective_date: "2025-06-01", source_pdf_url: null, created_by: null, created_at: "2025-05-01T00:00:00Z", published_at: "2025-06-01T00:00:00Z" },
            { id: "v-cap-1", guideline_id: "cap-children", version_number: "v1.2", status: "superseded", changelog: null, effective_date: "2024-06-01", source_pdf_url: null, created_by: null, created_at: "2024-05-01T00:00:00Z", published_at: "2024-06-01T00:00:00Z" },
        ],
    },
    {
        id: "neonatal-eos-sepsis",
        title: "Neonatal early-onset sepsis: risk stratification",
        short_title: "Neonatal EOS sepsis",
        guideline_type: "Interim",
        specialty_tags: ["Neonatology", "Infectious disease"],
        societies: ["AAP"],
        authors: [],
        doi: null,
        source: "authored",
        status: "in_review",
        current_version_id: "v-neo-2",
        next_review_date: null,
        created_at: "2025-03-01T00:00:00Z",
        updated_at: "2026-07-18T00:00:00Z",
        versions: [
            { id: "v-neo-3", guideline_id: "neonatal-eos-sepsis", version_number: "v2.0", status: "draft", changelog: null, effective_date: null, source_pdf_url: null, created_by: null, created_at: "2026-07-18T00:00:00Z", published_at: null },
            { id: "v-neo-2", guideline_id: "neonatal-eos-sepsis", version_number: "v1.2", status: "published", changelog: null, effective_date: "2025-09-01", source_pdf_url: null, created_by: null, created_at: "2025-08-01T00:00:00Z", published_at: "2025-09-01T00:00:00Z" },
            { id: "v-neo-1", guideline_id: "neonatal-eos-sepsis", version_number: "v1.0", status: "superseded", changelog: null, effective_date: "2024-09-01", source_pdf_url: null, created_by: null, created_at: "2024-08-01T00:00:00Z", published_at: "2024-09-01T00:00:00Z" },
        ],
    },
    {
        id: "uti-infants",
        title: "Urinary tract infection in infants 2–24 months",
        short_title: "UTI in infants",
        guideline_type: "Compendium",
        specialty_tags: ["Infectious disease", "Nephrology"],
        societies: ["AAP", "ESPID"],
        authors: [],
        doi: null,
        source: "authored",
        status: "in_review",
        current_version_id: "v-uti-1",
        next_review_date: null,
        created_at: "2025-06-01T00:00:00Z",
        updated_at: "2026-07-17T00:00:00Z",
        versions: [
            { id: "v-uti-2", guideline_id: "uti-infants", version_number: "v2.0", status: "draft", changelog: null, effective_date: null, source_pdf_url: null, created_by: null, created_at: "2026-07-17T00:00:00Z", published_at: null },
            { id: "v-uti-1", guideline_id: "uti-infants", version_number: "v1.1", status: "published", changelog: null, effective_date: "2025-07-01", source_pdf_url: null, created_by: null, created_at: "2025-06-01T00:00:00Z", published_at: "2025-07-01T00:00:00Z" },
        ],
    },
    {
        id: "asthma-ed",
        title: "Acute asthma exacerbation in the emergency department",
        short_title: "Acute asthma in ED",
        guideline_type: "Compendium",
        specialty_tags: ["Pulmonology", "Emergency medicine"],
        societies: ["GINA", "AAP"],
        authors: [],
        doi: null,
        source: "authored",
        status: "published",
        current_version_id: "v-asthma-2",
        next_review_date: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2026-06-27T00:00:00Z",
        versions: [
            { id: "v-asthma-2", guideline_id: "asthma-ed", version_number: "v4.0", status: "published", changelog: null, effective_date: "2026-01-01", source_pdf_url: null, created_by: null, created_at: "2025-12-01T00:00:00Z", published_at: "2026-01-01T00:00:00Z" },
            { id: "v-asthma-1", guideline_id: "asthma-ed", version_number: "v3.2", status: "superseded", changelog: null, effective_date: "2024-06-01", source_pdf_url: null, created_by: null, created_at: "2024-05-01T00:00:00Z", published_at: "2024-06-01T00:00:00Z" },
        ],
    },
    {
        id: "bronchiolitis-infants",
        title: "Bronchiolitis in infants under 24 months",
        short_title: "Bronchiolitis",
        guideline_type: "Compendium",
        specialty_tags: ["Pulmonology"],
        societies: ["AAP"],
        authors: [],
        doi: null,
        source: "authored",
        status: "published",
        current_version_id: "v-bronch-2",
        next_review_date: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2026-07-13T00:00:00Z",
        versions: [
            { id: "v-bronch-2", guideline_id: "bronchiolitis-infants", version_number: "v2.0", status: "published", changelog: "Outpatient care track", effective_date: "2026-07-13", source_pdf_url: null, created_by: null, created_at: "2026-06-01T00:00:00Z", published_at: "2026-07-13T00:00:00Z" },
            { id: "v-bronch-2b", guideline_id: "bronchiolitis-infants", version_number: "v2.0", status: "published", changelog: "Inpatient care track", effective_date: "2026-07-13", source_pdf_url: null, created_by: null, created_at: "2026-06-01T00:00:00Z", published_at: "2026-07-13T00:00:00Z" },
            { id: "v-bronch-1", guideline_id: "bronchiolitis-infants", version_number: "v1.3", status: "superseded", changelog: null, effective_date: "2024-01-01", source_pdf_url: null, created_by: null, created_at: "2023-12-01T00:00:00Z", published_at: "2024-01-01T00:00:00Z" },
        ],
    },
    {
        id: "febrile-seizures",
        title: "Simple febrile seizures in children 6–60 months",
        short_title: "Febrile seizures",
        guideline_type: "Interim",
        specialty_tags: ["Neurology"],
        societies: ["AAP"],
        authors: [],
        doi: null,
        source: "authored",
        status: "published",
        current_version_id: "v-febrile-2",
        next_review_date: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2026-05-18T00:00:00Z",
        versions: [
            { id: "v-febrile-2", guideline_id: "febrile-seizures", version_number: "v1.4", status: "published", changelog: null, effective_date: "2026-05-18", source_pdf_url: null, created_by: null, created_at: "2026-04-01T00:00:00Z", published_at: "2026-05-18T00:00:00Z" },
            { id: "v-febrile-1", guideline_id: "febrile-seizures", version_number: "v1.3", status: "superseded", changelog: null, effective_date: "2024-01-01", source_pdf_url: null, created_by: null, created_at: "2023-12-01T00:00:00Z", published_at: "2024-01-01T00:00:00Z" },
        ],
    },
    {
        id: "kawasaki-disease",
        title: "Diagnosis and management of Kawasaki disease",
        short_title: "Kawasaki disease",
        guideline_type: "Compendium",
        specialty_tags: ["Cardiology", "Infectious disease", "Rheumatology"],
        societies: ["AHA", "AAP"],
        authors: [],
        doi: null,
        source: "authored",
        status: "published",
        current_version_id: "v-kawasaki-3",
        next_review_date: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2026-07-11T00:00:00Z",
        versions: [
            { id: "v-kawasaki-3", guideline_id: "kawasaki-disease", version_number: "v3.1", status: "published", changelog: null, effective_date: "2026-07-11", source_pdf_url: null, created_by: null, created_at: "2026-06-01T00:00:00Z", published_at: "2026-07-11T00:00:00Z" },
            { id: "v-kawasaki-2", guideline_id: "kawasaki-disease", version_number: "v3.0", status: "superseded", changelog: null, effective_date: "2025-01-01", source_pdf_url: null, created_by: null, created_at: "2024-12-01T00:00:00Z", published_at: "2025-01-01T00:00:00Z" },
            { id: "v-kawasaki-1", guideline_id: "kawasaki-disease", version_number: "v2.0", status: "superseded", changelog: null, effective_date: "2023-01-01", source_pdf_url: null, created_by: null, created_at: "2022-12-01T00:00:00Z", published_at: "2023-01-01T00:00:00Z" },
        ],
    },
    {
        id: "dka-pediatric",
        title: "Diabetic ketoacidosis management in children",
        short_title: "Pediatric DKA",
        guideline_type: "Compendium",
        specialty_tags: ["Endocrinology", "Emergency medicine"],
        societies: ["ISPAD", "AAP"],
        authors: [],
        doi: null,
        source: "authored",
        status: "published",
        current_version_id: "v-dka-2",
        next_review_date: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2026-07-14T00:00:00Z",
        versions: [
            { id: "v-dka-2", guideline_id: "dka-pediatric", version_number: "v2.2", status: "published", changelog: null, effective_date: "2026-07-14", source_pdf_url: null, created_by: null, created_at: "2026-06-01T00:00:00Z", published_at: "2026-07-14T00:00:00Z" },
            { id: "v-dka-1", guideline_id: "dka-pediatric", version_number: "v2.1", status: "superseded", changelog: null, effective_date: "2025-01-01", source_pdf_url: null, created_by: null, created_at: "2024-12-01T00:00:00Z", published_at: "2025-01-01T00:00:00Z" },
        ],
    },
    {
        id: "atopic-dermatitis",
        title: "Atopic dermatitis management in children and adolescents",
        short_title: "Atopic dermatitis",
        guideline_type: "Interim",
        specialty_tags: ["Dermatology", "Allergy/Immunology"],
        societies: ["AAD"],
        authors: [],
        doi: null,
        source: "authored",
        status: "draft",
        current_version_id: null,
        next_review_date: null,
        created_at: "2026-07-17T00:00:00Z",
        updated_at: "2026-07-17T14:00:00Z",
        versions: [
            { id: "v-atopic-1", guideline_id: "atopic-dermatitis", version_number: "v1.0", status: "draft", changelog: null, effective_date: null, source_pdf_url: null, created_by: null, created_at: "2026-07-17T14:00:00Z", published_at: null },
        ],
    },
    {
        id: "adhd-diagnosis",
        title: "ADHD diagnosis and treatment in children and adolescents",
        short_title: "ADHD diagnosis",
        guideline_type: "Compendium",
        specialty_tags: ["Neurology", "Psychiatry"],
        societies: ["AAP"],
        authors: [],
        doi: null,
        source: "authored",
        status: "published",
        current_version_id: "v-adhd-2",
        next_review_date: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2026-06-06T00:00:00Z",
        versions: [
            { id: "v-adhd-2", guideline_id: "adhd-diagnosis", version_number: "v2.0", status: "published", changelog: null, effective_date: "2026-06-06", source_pdf_url: null, created_by: null, created_at: "2026-05-01T00:00:00Z", published_at: "2026-06-06T00:00:00Z" },
            { id: "v-adhd-1b", guideline_id: "adhd-diagnosis", version_number: "v1.5", status: "superseded", changelog: null, effective_date: "2025-01-01", source_pdf_url: null, created_by: null, created_at: "2024-12-01T00:00:00Z", published_at: "2025-01-01T00:00:00Z" },
            { id: "v-adhd-1", guideline_id: "adhd-diagnosis", version_number: "v1.0", status: "superseded", changelog: null, effective_date: "2023-01-01", source_pdf_url: null, created_by: null, created_at: "2022-12-01T00:00:00Z", published_at: "2023-01-01T00:00:00Z" },
        ],
    },
    {
        id: "constipation-pediatric",
        title: "Functional constipation in infants and children",
        short_title: "Pediatric constipation",
        guideline_type: "Compendium",
        specialty_tags: ["Gastroenterology"],
        societies: ["NASPGHAN", "ESPGHAN"],
        authors: [],
        doi: null,
        source: "authored",
        status: "published",
        current_version_id: "v-constip-1",
        next_review_date: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2026-07-04T00:00:00Z",
        versions: [
            { id: "v-constip-1", guideline_id: "constipation-pediatric", version_number: "v1.3", status: "published", changelog: null, effective_date: "2026-07-04", source_pdf_url: null, created_by: null, created_at: "2026-06-01T00:00:00Z", published_at: "2026-07-04T00:00:00Z" },
            { id: "v-constip-0", guideline_id: "constipation-pediatric", version_number: "v1.2", status: "superseded", changelog: null, effective_date: "2025-01-01", source_pdf_url: null, created_by: null, created_at: "2024-12-01T00:00:00Z", published_at: "2025-01-01T00:00:00Z" },
        ],
    },
    {
        id: "anaphylaxis-management",
        title: "Recognition and management of anaphylaxis",
        short_title: "Anaphylaxis management",
        guideline_type: "Compendium",
        specialty_tags: ["Allergy/Immunology", "Emergency medicine"],
        societies: ["AAAAI", "ACAAI"],
        authors: [],
        doi: null,
        source: "authored",
        status: "published",
        current_version_id: "v-ana-2",
        next_review_date: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2026-07-15T00:00:00Z",
        versions: [
            { id: "v-ana-2", guideline_id: "anaphylaxis-management", version_number: "v2.0", status: "published", changelog: "Adult track", effective_date: "2026-07-15", source_pdf_url: null, created_by: null, created_at: "2026-06-01T00:00:00Z", published_at: "2026-07-15T00:00:00Z" },
            { id: "v-ana-2b", guideline_id: "anaphylaxis-management", version_number: "v2.0", status: "published", changelog: "Pediatric track", effective_date: "2026-07-15", source_pdf_url: null, created_by: null, created_at: "2026-06-01T00:00:00Z", published_at: "2026-07-15T00:00:00Z" },
            { id: "v-ana-1", guideline_id: "anaphylaxis-management", version_number: "v1.4", status: "superseded", changelog: null, effective_date: "2024-01-01", source_pdf_url: null, created_by: null, created_at: "2023-12-01T00:00:00Z", published_at: "2024-01-01T00:00:00Z" },
        ],
    },
    {
        id: "iron-deficiency-anemia",
        title: "Screening and treatment of iron deficiency anemia in infants",
        short_title: "Iron deficiency anemia",
        guideline_type: "Interim",
        specialty_tags: ["Hematology", "Nutrition"],
        societies: ["AAP"],
        authors: [],
        doi: null,
        source: "authored",
        status: "published",
        current_version_id: "v-iron-1",
        next_review_date: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2026-06-18T00:00:00Z",
        versions: [
            { id: "v-iron-1", guideline_id: "iron-deficiency-anemia", version_number: "v1.1", status: "published", changelog: null, effective_date: "2026-06-18", source_pdf_url: null, created_by: null, created_at: "2026-05-01T00:00:00Z", published_at: "2026-06-18T00:00:00Z" },
            { id: "v-iron-0", guideline_id: "iron-deficiency-anemia", version_number: "v1.0", status: "superseded", changelog: null, effective_date: "2025-01-01", source_pdf_url: null, created_by: null, created_at: "2024-12-01T00:00:00Z", published_at: "2025-01-01T00:00:00Z" },
        ],
    },
    {
        id: "otitis-media",
        title: "Diagnosis and management of acute otitis media",
        short_title: "Acute otitis media",
        guideline_type: "Compendium",
        specialty_tags: ["Otolaryngology", "Infectious disease"],
        societies: ["AAP", "AAFP"],
        authors: [],
        doi: null,
        source: "authored",
        status: "in_review",
        current_version_id: "v-otitis-3",
        next_review_date: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2026-07-10T00:00:00Z",
        versions: [
            { id: "v-otitis-4", guideline_id: "otitis-media", version_number: "v3.0", status: "draft", changelog: null, effective_date: null, source_pdf_url: null, created_by: null, created_at: "2026-07-10T00:00:00Z", published_at: null },
            { id: "v-otitis-3", guideline_id: "otitis-media", version_number: "v2.3", status: "published", changelog: null, effective_date: "2026-01-01", source_pdf_url: null, created_by: null, created_at: "2025-12-01T00:00:00Z", published_at: "2026-01-01T00:00:00Z" },
            { id: "v-otitis-2", guideline_id: "otitis-media", version_number: "v2.2", status: "superseded", changelog: null, effective_date: "2025-01-01", source_pdf_url: null, created_by: null, created_at: "2024-12-01T00:00:00Z", published_at: "2025-01-01T00:00:00Z" },
            { id: "v-otitis-1", guideline_id: "otitis-media", version_number: "v2.0", status: "superseded", changelog: null, effective_date: "2024-01-01", source_pdf_url: null, created_by: null, created_at: "2023-12-01T00:00:00Z", published_at: "2024-01-01T00:00:00Z" },
        ],
    },
    {
        id: "neonatal-hyperbilirubinemia",
        title: "Management of hyperbilirubinemia in the newborn",
        short_title: "Neonatal hyperbilirubinemia",
        guideline_type: "Compendium",
        specialty_tags: ["Neonatology", "Hepatology"],
        societies: ["AAP"],
        authors: [],
        doi: null,
        source: "authored",
        status: "published",
        current_version_id: "v-bili-2",
        next_review_date: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2026-06-13T00:00:00Z",
        versions: [
            { id: "v-bili-2", guideline_id: "neonatal-hyperbilirubinemia", version_number: "v2.1", status: "published", changelog: null, effective_date: "2026-06-13", source_pdf_url: null, created_by: null, created_at: "2026-05-01T00:00:00Z", published_at: "2026-06-13T00:00:00Z" },
            { id: "v-bili-1", guideline_id: "neonatal-hyperbilirubinemia", version_number: "v2.0", status: "superseded", changelog: null, effective_date: "2025-01-01", source_pdf_url: null, created_by: null, created_at: "2024-12-01T00:00:00Z", published_at: "2025-01-01T00:00:00Z" },
            { id: "v-bili-0", guideline_id: "neonatal-hyperbilirubinemia", version_number: "v1.0", status: "superseded", changelog: null, effective_date: "2024-01-01", source_pdf_url: null, created_by: null, created_at: "2023-12-01T00:00:00Z", published_at: "2024-01-01T00:00:00Z" },
        ],
    },
    {
        id: "juvenile-idiopathic-arthritis",
        title: "Treatment recommendations for juvenile idiopathic arthritis",
        short_title: "Juvenile idiopathic arthritis",
        guideline_type: "Interim",
        specialty_tags: ["Rheumatology"],
        societies: ["ACR", "CARRA"],
        authors: [],
        doi: null,
        source: "authored",
        status: "draft",
        current_version_id: null,
        next_review_date: null,
        created_at: "2026-07-17T00:00:00Z",
        updated_at: "2026-07-17T00:00:00Z",
        versions: [
            { id: "v-jia-1", guideline_id: "juvenile-idiopathic-arthritis", version_number: "v1.0", status: "draft", changelog: null, effective_date: null, source_pdf_url: null, created_by: null, created_at: "2026-07-17T00:00:00Z", published_at: null },
        ],
    },
];