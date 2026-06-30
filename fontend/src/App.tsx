import { Route, Routes } from "react-router-dom";

import { FileIngestionPage } from "./pages/FileIngestionPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FileIngestionPage />} />
      <Route path="*" element={<FileIngestionPage />} />
    </Routes>
  );
}
