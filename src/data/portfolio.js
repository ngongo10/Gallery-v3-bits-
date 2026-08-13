// Portfolio data generated from Cloudinary public_id list
// Generated: 2026-08-13T19:16:09Z

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/a9rfzg6k/image/upload/f_auto,q_auto';
const cloudinaryUrl = (path) => {
  if (!path.startsWith("/")) return path;
  const publicPath = path.startsWith("/images/") ? path.substring(8) : path.substring(1);
  return `${CLOUDINARY_BASE_URL}/${encodeURI(publicPath)}`;
};

export const categories = [
  {
    "id": "dreamcore",
    "label": "Dreamcore",
    "cover": cloudinaryUrl("/Somewhere_where_everything_was_nothing_and_you"),
    "items": [
      {
        "id": "dreamcore-0",
        "image": cloudinaryUrl("/Somewhere_where_everything_was_nothing_and_you"),
        "caption": "Dreamcore #1"
      },
    ]
  },
  {
    "id": "graduation-photography",
    "label": "Graduation Photography",
    "cover": cloudinaryUrl("/20210505-DSC01007"),
    "items": [
      {
        "id": "graduation-photography-0",
        "image": cloudinaryUrl("/20210505-DSC01007"),
        "caption": "Graduation Photography #1"
      },
    ]
  },
  {
    "id": "osean",
    "label": "osean",
    "cover": cloudinaryUrl("/1108237420831272260"),
    "items": [
      {
        "id": "osean-0",
        "image": cloudinaryUrl("/1108237420831272260"),
        "caption": "osean #1"
      },
    ]
  },
  {
    "id": "portrait",
    "label": "portrait",
    "cover": cloudinaryUrl("/20210505-DSC00829"),
    "items": [
      {
        "id": "portrait-0",
        "image": cloudinaryUrl("/20210505-DSC00829"),
        "caption": "portrait #1"
      },
    ]
  },
  {
    "id": "run-away",
    "label": "Run away",
    "cover": cloudinaryUrl("/IMG20240628084759"),
    "items": [
      {
        "id": "run-away-0",
        "image": cloudinaryUrl("/IMG20240628084759"),
        "caption": "Run away #1"
      },
    ]
  },
  {
    "id": "tiec-bai-bien",
    "label": "Tiệc bãi biển",
    "cover": cloudinaryUrl("/20210505-DSC00886"),
    "items": [
      {
        "id": "tiec-bai-bien-0",
        "image": cloudinaryUrl("/20210505-DSC00886"),
        "caption": "Tiệc bãi biển #1"
      },
    ]
  },
];

export const allItems = [
  {
    "id": "dreamcore-0",
    "image": cloudinaryUrl("/Somewhere_where_everything_was_nothing_and_you"),
    "title": "Dreamcore #1",
    "category": "dreamcore",
    "categoryLabel": "Dreamcore"
  },
  {
    "id": "graduation-photography-0",
    "image": cloudinaryUrl("/20210505-DSC01007"),
    "title": "Graduation Photography #1",
    "category": "graduation-photography",
    "categoryLabel": "Graduation Photography"
  },
  {
    "id": "osean-0",
    "image": cloudinaryUrl("/1108237420831272260"),
    "title": "osean #1",
    "category": "osean",
    "categoryLabel": "osean"
  },
  {
    "id": "portrait-0",
    "image": cloudinaryUrl("/20210505-DSC00829"),
    "title": "portrait #1",
    "category": "portrait",
    "categoryLabel": "portrait"
  },
  {
    "id": "run-away-0",
    "image": cloudinaryUrl("/IMG20240628084759"),
    "title": "Run away #1",
    "category": "run-away",
    "categoryLabel": "Run away"
  },
  {
    "id": "tiec-bai-bien-0",
    "image": cloudinaryUrl("/20210505-DSC00886"),
    "title": "Tiệc bãi biển #1",
    "category": "tiec-bai-bien",
    "categoryLabel": "Tiệc bãi biển"
  },
];
