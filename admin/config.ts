const stringField = (name: string, label: string) => ({ name, label, widget: 'string' });
const imageField = (name: string, label: string) => ({
  name, label, widget: 'image', choose_url: false,
});
const markdownField = (name: string, label: string) => ({
  name, label, widget: 'markdown', buttons: ['bold', 'italic', 'link', 'bulleted-list', 'numbered-list'],
  editor_components: [],
  hint: 'Use {{age}} for age and {{birthday}} after "years old" for the birthday suffix. Raw HTML and inline images are not supported.',
});
const blockField = {
  name: 'blocks', label: 'Content blocks', widget: 'list', min: 1,
  types: [
    { name: 'text', label: 'Text', widget: 'object', fields: [markdownField('body', 'Text')] },
    {
      name: 'heading', label: 'Heading', widget: 'object',
      fields: [
        markdownField('text', 'Heading'),
        { name: 'level', label: 'Heading level', widget: 'select', options: [2, 3, 4], default: 3 },
      ],
    },
    {
      name: 'image', label: 'Image', widget: 'object',
      fields: [
        imageField('src', 'Image'),
        { ...stringField('alt', 'Alternative text'), required: false, default: '', hint: 'Describe meaningful images; leave empty only for decorative images.' },
        { name: 'width', label: 'Original width (px)', widget: 'number', value_type: 'int', min: 1 },
        { name: 'height', label: 'Original height (px)', widget: 'number', value_type: 'int', min: 1 },
      ],
    },
  ],
};

export function cmsConfig({ basePath = '' } = {}) {
  return {
    backend: {
      name: 'github', repo: 'diegofelipece/diego-esteves', branch: 'master',
      commit_messages: {
        create: 'feat(content): add {{collection}} {{slug}}',
        update: 'content: update {{collection}} {{slug}}',
        delete: 'content: remove {{collection}} {{slug}}',
        uploadMedia: 'content: upload {{path}}',
        deleteMedia: 'content: remove {{path}}',
      },
    },
    local_backend: { url: 'http://localhost:8081/api/v1' },
    load_config_file: false,
    publish_mode: 'editorial_workflow',
    media_folder: 'public/images/uploads',
    public_folder: '/images/uploads',
    site_url: 'https://diegoesteves.ink',
    display_url: `${basePath}/`,
    show_preview_links: false,
    slug: { encoding: 'ascii', clean_accents: true },
    collections: [
      {
        name: 'profile', label: 'Professional profile', publish: false, delete: false,
        files: [{
          name: 'profile', label: 'Professional profile', file: 'content/profile/diego-esteves.json', format: 'json',
          fields: [
            {
              name: 'basics', label: 'Basics (public)', widget: 'object',
              fields: [
                stringField('name', 'Name'), stringField('label', 'Professional label'),
                { name: 'summary', label: 'Summary', widget: 'text' },
                { ...stringField('birthDate', 'Birth date'), pattern: ['^\\d{4}-\\d{2}-\\d{2}$', 'Use YYYY-MM-DD.'], hint: 'Publicly exported. This is the single source for the calculated age.' },
                stringField('url', 'Website'),
                { name: 'profiles', label: 'Public profiles', widget: 'list', fields: [stringField('network', 'Network'), stringField('url', 'URL')] },
              ],
            },
            {
              name: 'work', label: 'Experience', widget: 'list', required: false, default: [],
              fields: [
                stringField('name', 'Organization'),
                ...['position', 'startDate', 'endDate', 'summary'].map((name) => ({ ...stringField(name, name), required: false })),
              ],
            },
            {
              name: 'education', label: 'Education', widget: 'list', required: false, default: [],
              fields: [
                stringField('institution', 'Institution'),
                ...['area', 'studyType', 'startDate', 'endDate'].map((name) => ({ ...stringField(name, name), required: false })),
              ],
            },
            {
              name: 'skills', label: 'Skills', widget: 'list', required: false, default: [],
              fields: [stringField('name', 'Skill'), { name: 'keywords', label: 'Keywords', widget: 'list' }],
            },
            {
              name: 'projects', label: 'Profile projects', widget: 'list', required: false, default: [],
              fields: [
                stringField('name', 'Project'),
                ...['startDate', 'url', 'description'].map((name) => ({ ...stringField(name, name), required: false })),
              ],
            },
          ],
        }],
      },
      {
        name: 'projects', label: 'Projects', label_singular: 'Project',
        folder: 'content/projects', extension: 'json', format: 'json',
        create: true, delete: false, publish: false,
        identifier_field: 'title', slug: '{{fields.slug}}',
        summary: '{{order}} - {{title}}',
        sortable_fields: ['order', 'title'],
        fields: [
          {
            ...stringField('slug', 'URL slug'),
            pattern: ['^[a-z0-9]+(-[a-z0-9]+)*$', 'Use lowercase letters, digits, and single hyphens.'],
            hint: 'Set once when creating a project. Do not change an existing slug; it must match the JSON filename.',
          },
          stringField('title', 'Title'), stringField('category', 'Category'),
          imageField('coverImage', 'Cover image'),
          { name: 'order', label: 'Display order', widget: 'number', value_type: 'int', min: 0, default: 10 },
          { name: 'published', label: 'Include on the public site', widget: 'boolean', default: true, hint: 'Only takes effect after your PR is merged and deployed.' },
          stringField('description', 'SEO description'), blockField,
          {
            name: 'links', label: 'External links', widget: 'list', required: false, default: [],
            fields: [
              stringField('url', 'URL'),
              { name: 'icon', label: 'Icon', widget: 'select', required: false, default: 'link', options: ['android', 'apple', 'behance', 'facebook', 'github', 'link', 'linkedin', 'tumbl'] },
            ],
          },
        ],
      },
      {
        name: 'pages', label: 'Pages', publish: false, delete: false,
        files: [{
          name: 'about', label: 'About', file: 'content/pages/about.json', format: 'json',
          fields: [stringField('title', 'Page title'), stringField('description', 'SEO description'), blockField],
        }],
      },
      {
        name: 'settings', label: 'Homepage', publish: false, delete: false,
        files: [{
          name: 'home', label: 'Homepage', file: 'content/settings/home.json', format: 'json',
          fields: [
            stringField('title', 'Page title'), stringField('description', 'SEO description'),
            { name: 'logoTitle', label: 'Logo title', widget: 'text', hint: 'One line per logo line.' },
            stringField('tagline', 'Tagline'),
            { name: 'bannerImages', label: 'Banner images', widget: 'list', min: 1, field: imageField('image', 'Image') },
            {
              name: 'about', label: 'About excerpt', widget: 'object',
              fields: [
                stringField('heading', 'Heading'),
                { name: 'text', label: 'Excerpt', widget: 'text', hint: 'Use {{age}} for age and {{birthday}} after "years old" for the birthday suffix.' },
                imageField('image', 'Portrait'), { ...stringField('imageAlt', 'Portrait alternative text'), required: false, default: '' },
                stringField('buttonLabel', 'About button label'),
              ],
            },
          ],
        }],
      },
    ],
  };
}
