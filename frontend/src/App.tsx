import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import MainLayout from './layouts/MainLayout';
import { MainView, DocumentView, AudioView, ImageView, VideoView,
  PdfIndex, PdfCompress, PdfConvert, PdfOcr, PdfSplit, PdfView
} from './views';

function App() {

  return (
    <>
      <BrowserRouter>
       <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<MainView />} />
          <Route path='documents'>
            <Route index element={<DocumentView />} />
            <Route path='pdf' element={<PdfView />}>
              <Route index element={<PdfIndex />} />
              <Route path='compress' element={<PdfCompress />} />
              <Route path='convert' element={<PdfConvert />} />
              <Route path='ocr' element={<PdfOcr />} />
              <Route path='split' element={<PdfSplit />} />
            </Route>
          </Route>
          <Route path='images'>
            <Route index element={<ImageView />} />
          </Route>
          <Route path='videos'>
            <Route index element={<VideoView />} />
          </Route>
          <Route path='audios'>
            <Route index element={<AudioView />} />
          </Route>
          <Route path='*' element={<Navigate to='/' replace />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
