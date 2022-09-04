import React, { useState } from "react";
import axios from "axios";
import UUID from 'uuidjs';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Button from "@mui/material/Button";
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {

  type ResponseUpload = {
    result: string;
  }
  type ResponseProgress = {
    progress: number;
  }

  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const id: string = UUID.generate();
  const urlOrigin: string = "http://127.0.0.1/";
  const inputId: string = "input";


  // progressリクエスト
  const getProgress = () => {

    // 送信データ
    const url: string = urlOrigin + "progress";
    const data = new FormData();
    data.append("id", id);
    const header = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }

    // intervalごとに繰り返し問い合わせ
    const interval: number = 1000;
    let progress: number = 0;
    let timer = setInterval(async () => {
      const response = await axios.post<ResponseProgress>(url, data, header);
      progress = response.data.progress;
      setProgress(progress);

      // 進捗100%になったら終了
      if (progress >= 100) {
        clearInterval(timer);
      }
    }, interval);
  };

  // uploadリクエスト
  const handleOnSubmit = async (e: React.SyntheticEvent): Promise<void> => {
    e.preventDefault();
    setMessage("送信した");

    // 送信データ
    const data = new FormData();
    files.forEach((file) => {
      data.append("file", file);
    });
    data.append("id", id);
    const header = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }

    // ファイルを送信。すべてのリクエストがresolveされるまで次に進まない
    const url: string = urlOrigin + "upload";
    const responses = await Promise.allSettled([
      axios.post<ResponseUpload>(url, data, header),
      Promise.resolve(getProgress()),
    ])

    // 結果を表示    
    const response = responses[0];
    if (response.status === 'fulfilled') {
      const result: string = response.value.data.result;
      setMessage("処理結果: " + result);
    }


  };

  const handleOnAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles([...files, ...e.target.files]);
    setProgress(0);
    setMessage("ファイル選択した");
  };

  const styleDiv = {
    margin: "auto",
    width: "50%",
    height: "50%"

  }

  const styleButton = {
    margin: "20px",
  }

  const styleProgress = {
    margin: "20px",
    width: "300px"
  }

  const styleInput = {
    display: "none"
  }

  return (


    <div style={styleDiv}>
      <form
        action=""
        onSubmit={(e) => handleOnSubmit(e)}
      >
        <label htmlFor={inputId}>
          <Button
            variant="contained"
            component="span"
            style={styleButton}
          >
            ファイル選択
          </Button>
          <input
            id={inputId}
            type="file"
            multiple
            style={styleInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleOnAddFile(e)
            }
            onClick={(event) => {
              (event.target as HTMLInputElement).value = "";
            }}
          />
        </label>

        {/* submitボタン */}
        <Button
          variant="contained"
          type="submit"
          disableElevation
          disabled={files.length === 0}
          style={styleButton}
        >
          送信
        </Button>
      </form>

      {/* プログレスバー */}
      <div
        style={styleProgress}
      >
        <ProgressBar
          now={progress}
          label={`${progress}%`}
        />
      </div>

      {/* メッセージ */}
      <p>{message}</p>
    </div>


  );
}

export default App;
