import Board from './components/Board'
import './App.css'
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Board />
      <Toaster
        position="bottom-right"
        gutter={10}
        toastOptions={{
          duration: 3000,
        }}
      />
    </>
  );
}