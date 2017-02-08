/**
 * Created by reedvilanueva on 11/30/16.
 */

import { CategoriesDict, CategoriesDictSchema } from '../../api/categories-dict/categories-dict.js';
import { _ } from 'meteor/underscore';

/**
 * A list of Categories to pre-fill the Collection.
 * @type {*[]}
 */
const seeds = [
  {
    category: 'Creative Media',
    related: ['Game Design', 'Digital Animation'],
  },
  {
    category: 'Accounting',
    related: [],
  },
  {
    category: 'Aerospace Studies',
    related: [],
  },
  {
    category: 'American Studies',
    related: [],
  },
  {
    category: 'Anatomy',
    related: [],
  },
  {
    category: 'Animal Science',
    related: [],
  },
  {
    category: 'Anthropology',
    related: [],
  },
  {
    category: 'Arabic',
    related: [],
  },
  {
    category: 'Architecture',
    related: [],
  },
  {
    category: 'Art',
    related: [],
  },
  {
    category: 'Asian Studies',
    related: [],
  },
  {
    category: 'Astronomy',
    related: [],
  },
  {
    category: 'Atmospheric Sciences',
    related: [],
  },
  {
    category: 'Biochemistry',
    related: [],
  },
  {
    category: 'Bioengineering',
    related: [],
  },
  {
    category: 'Biology',
    related: [],
  },
  {
    category: 'Biomedical Science',
    related: [],
  },
  {
    category: 'Botany',
    related: [],
  },
  {
    category: 'Business',
    related: [],
  },
  {
    category: 'Business Law',
    related: [],
  },
  {
    category: 'Cambodian',
    related: [],
  },
  {
    category: 'Cell and Molecular Biology',
    related: [],
  },
  {
    category: 'Chamorro',
    related: [],
  },
  {
    category: 'Chemistry',
    related: [],
  },
  {
    category: 'Chinese Language & Literature',
    related: [],
  },
  {
    category: 'Civil and Environmental Engr',
    related: [],
  },
  {
    category: 'Communication & Info Sciences',
    related: [],
  },
  {
    category: 'Dance',
    related: [],
  },
  {
    category: 'Dental Hygiene',
    related: [],
  },
  {
    category: 'Developmental & Repro Biology',
    related: [],
  },
  {
    category: 'Disability Studies',
    related: [],
  },
  {
    category: 'East Asian Languages and Lit',
    related: [],
  },
  {
    category: 'Economics',
    related: [],
  },
  {
    category: 'Educational Administration',
    related: [],
  },
  {
    category: 'Educational Psychology',
    related: [],
  },
  {
    category: 'Electrical Engineering',
    related: [],
  },
  {
    category: 'English',
    related: [],
  },
  {
    category: 'Ethnic Studies',
    related: [],
  },
  {
    category: 'Family Medicine and Community Health',
    related: [],
  },
  {
    category: 'Family Resources',
    related: [],
  },
  {
    category: 'Fashion Design Textiles',
    related: [],
  },
  {
    category: 'Filipino',
    related: [],
  },
  {
    category: 'Finance',
    related: [],
  },
  {
    category: 'Food Science and Human Nutrition',
    related: [],
  },
  {
    category: 'French',
    related: [],
  },
  {
    category: 'Geography',
    related: [],
  },
  {
    category: 'Geology and Geophysics',
    related: [],
  },
  {
    category: 'Geriatric Medicine',
    related: [],
  },
  {
    category: 'German',
    related: [],
  },
  {
    category: 'Greek',
    related: [],
  },
  {
    category: 'Hawaiian Studies',
    related: [],
  },
  {
    category: 'Hindi',
    related: [],
  },
  {
    category: 'History',
    related: [],
  },
  {
    category: 'Human Resources Managment',
    related: [],
  },
  {
    category: 'Ilokano',
    related: [],
  },
  {
    category: 'Indo - Pacific Languages',
    related: [],
  },
  {
    category: 'Indonesian',
    related: [],
  },
  {
    category: 'Information Technology Managment',
    related: [],
  },
  {
    category: 'Information and Computer Sciences',
    related: [],
  },
  {
    category: 'Insurance',
    related: [],
  },
  {
    category: 'Italian',
    related: [],
  },
  {
    category: 'Japanese Language and Literature',
    related: [],
  },
  {
    category: 'Journalism',
    related: [],
  },
  {
    category: 'Kinesiology & Rehab Science',
    related: [],
  },
  {
    category: 'Korean',
    related: [],
  },
  {
    category: 'American and European Language and Literature',
    related: [],
  },
  {
    category: 'Latin',
    related: [],
  },
  {
    category: 'Latin American and Iberian Studies',
    related: [],
  },
  {
    category: 'Law',
    related: [],
  },
  {
    category: 'Learning Design and Technology',
    related: [],
  },
  {
    category: 'Library and Information Science',
    related: [],
  },
  {
    category: 'Linguistics',
    related: [],
  },
  {
    category: 'Management',
    related: [],
  },
  {
    category: 'Maori',
    related: [],
  },
  {
    category: 'Marine Biology',
    related: [],
  },
  {
    category: 'Marketing',
    related: [],
  },
  {
    category: 'Mathematics',
    related: [],
  },
  {
    category: 'Mechanical Engineering',
    related: [],
  },
  {
    category: 'Medical Education',
    related: [],
  },
  {
    category: 'Medical Technology',
    related: [],
  },
  {
    category: 'Medicine',
    related: [],
  },
  {
    category: 'Microbiology',
    related: [],
  },
  {
    category: 'Military Science and Leadership',
    related: [],
  },
  {
    category: 'Molecular and Cell Biology',
    related: [],
  },
  {
    category: 'Molecular Bioscience and Bioengineering',
    related: [],
  },
  {
    category: 'Music',
    related: [],
  },
  {
    category: 'Natural Resources and Environmental Management',
    related: [],
  },
  {
    category: 'Nursing',
    related: [],
  },
  {
    category: 'Obstetrics & Gynecology',
    related: [],
  },
  {
    category: 'Ocean and Resources Engineering',
    related: [],
  },
  {
    category: 'Oceanography',
    related: [],
  },
  {
    category: 'Pacific Islands Studies',
    related: [],
  },
  {
    category: 'Pathology',
    related: [],
  },
  {
    category: 'Peace and Conflict Education',
    related: [],
  },
  {
    category: 'Pediatrics',
    related: [],
  },
  {
    category: 'Persian',
    related: [],
  },
  {
    category: 'Pharmacology',
    related: [],
  },
  {
    category: 'Philosophy',
    related: [],
  },
  {
    category: 'Physics',
    related: [],
  },
  {
    category: 'Physiology',
    related: [],
  },
  {
    category: 'Plant and Environmental Protection Science',
    related: [],
  },
  {
    category: 'Political Science',
    related: [],
  },
  {
    category: 'Portuguese',
    related: [],
  },
  {
    category: 'Psychiatry',
    related: [],
  },
  {
    category: 'Psychology',
    related: [],
  },
  {
    category: 'Public Administration',
    related: [],
  },
  {
    category: 'Public Health',
    related: [],
  },
  {
    category: 'Public Policy Center',
    related: [],
  },
  {
    category: 'Real Estate',
    related: [],
  },
  {
    category: 'Religion',
    related: [],
  },
  {
    category: 'Russian',
    related: [],
  },
  {
    category: 'Samoan',
    related: [],
  },
  {
    category: 'Sanskrit',
    related: [],
  },
  {
    category: 'Social Science',
    related: [],
  },
  {
    category: 'Social Work',
    related: [],
  },
  {
    category: 'Sociology',
    related: [],
  },
  {
    category: 'Spanish',
    related: [],
  },
  {
    category: 'Special Education',
    related: [],
  },
  {
    category: 'Surgery',
    related: [],
  },
  {
    category: 'Tahitian',
    related: [],
  },
  {
    category: 'Thai',
    related: [],
  },
  {
    category: 'Theatre',
    related: [],
  },
  {
    category: 'Tongan',
    related: [],
  },
  {
    category: 'Translation & Interpretation',
    related: [],
  },
  {
    category: 'Travel Industry Management',
    related: [],
  },
  {
    category: 'Tropical Med and Medcl Micro',
    related: [],
  },
  {
    category: 'Tropical Plant and Soil Sciences',
    related: [],
  },
  {
    category: 'Urban & Regional Planning',
    related: [],
  },
  {
    category: 'Vietnamese',
    related: [],
  },
  {
    category: 'Womens Studies',
    related: [],
  },
  {
    category: 'Zoology',
    related: [],
  },
];

/**
 * Initialize the categories dict if empty with seed data.
 */
if (CategoriesDict.find().count() === 0) {
  _.each(seeds, function seedCategories(contact) {
    CategoriesDict.insert(contact);
  });
}