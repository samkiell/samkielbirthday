export interface PictureItem {
  id: string;
  filename: string;
  title: string;
}

export const ALL_PICTURES: PictureItem[] = [
  { id: "pic-01", filename: "samkielbday01.jpg", title: "feeling himself" },
  { id: "pic-02", filename: "samkielbday02.jpg", title: "chowdeck event" },
  { id: "pic-03", filename: "samkielbday03.jpg", title: "car looks good on me" },
  { id: "pic-04", filename: "samkielbday04.jpg", title: "still becoming" },
  { id: "pic-05", filename: "samkielbday05.jpg", title: "looking forward" },
  { id: "pic-06", filename: "samkielbday06.jpg", title: "third smile this year" },
  { id: "pic-07", filename: "samkielbday07.jpg", title: "pretending to be busy" },
  { id: "pic-08", filename: "samkielbday08.jpg", title: "church boy" },
  { id: "pic-09", filename: "samkielbday09.jpg", title: "at sheraton" },
  { id: "pic-10", filename: "samkielbday10.jpg", title: "cs conference" },
  { id: "pic-11", filename: "samkielbday11.jpg", title: "gdg web sessions" },
  { id: "pic-12", filename: "samkielbday12.jpg", title: "web3 event" },
  { id: "pic-13", filename: "samkielbday13.jpg", title: "found a nice bg for pics" },
  { id: "pic-14", filename: "samkielbday14.jpg", title: "in church" },
  { id: "pic-15", filename: "samkielbday15.jpg", title: "faj hostel, oau." },
  { id: "pic-16", filename: "samkielbday16.jpg", title: "pretending to focus" },
  { id: "pic-17", filename: "samkielbday17.png", title: "at squad hack" },
  { id: "pic-18", filename: "samkielbday18.jpg", title: "showcasing my product" },
  { id: "pic-19", filename: "samkielbday19.jpg", title: "my babe and I" },
];

export function getPictureById(id: string): PictureItem | undefined {
  return ALL_PICTURES.find((p) => p.id === id);
}
