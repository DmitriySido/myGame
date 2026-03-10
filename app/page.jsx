"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import SignInButton from "./components/buttons/SignInButton";
import CreateRoomButton from "./components/buttons/CreateRoomButton";
import MakeButton from "./components/buttons/MakeButton";
import BackButton from "./components/buttons/BackButton";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState("");
  const [inputRoom, setInputRoom] = useState("");
  const [secret, setSecret] = useState("");
  const [guess, setGuess] = useState("");
  const [turn, setTurn] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  const [name, setName] = useState("");
  const [nameEntered, setNameEntered] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [secretSet, setSecretSet] = useState(false);

  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null)

const myMessagesRef = useRef(null);
const enemyMessagesRef = useRef(null);

useEffect(() => {

  if (myMessagesRef.current) {
    myMessagesRef.current.scrollTop = myMessagesRef.current.scrollHeight;
  }

  if (enemyMessagesRef.current) {
    enemyMessagesRef.current.scrollTop = enemyMessagesRef.current.scrollHeight;
  }

}, [messages]);

    const randomNameArray = [
      "Рыжа мавпа",
      "Кабачок228",
      "Бананчик",
      "Пельмешок",
      "Котопёс",
      "Fантiк",
      "бобик_в_шляпке",
      "мОйонезный Шльопок",
      "Гороховый король"
    ];

    // Выбираем случайное имя один раз при рендере
    const [randomName] = useState(randomNameArray[Math.floor(Math.random() * randomNameArray.length)]);

  useEffect(() => {
    const s = io(window.location.origin);
    setSocket(s);

    s.on("roomCreated", (roomId) => setRoom(roomId));

    s.on("otherPlayer", ({ name }) => setOtherName(name));

    s.on("bothConnected", () => setConnected(true));

    s.on("startGame", (firstTurn) => setTurn(firstTurn));
    s.on("changeTurn", (newTurn) => setTurn(newTurn));

    s.on("guessResult", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    s.on("gameOver", (winnerId) => {
      setGameOver(true);
      setWinner(winnerId);
    });

    return () => s.disconnect();
  }, []);

  // ------------------ Обработчики ------------------
  const handleInputRoomChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setInputRoom(val);
  };
  const handleSecretChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) setSecret(val);
  };
  const handleGuessChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) setGuess(val);
  };

  const createRoom = () => socket.emit("createRoom", { name });
  const joinRoom = () => {
    socket.emit("joinRoom", { roomId: inputRoom, name });
    setRoom(inputRoom);
  };
  const sendSecret = () => {
    if (secret.length !== 4) return alert("Число должно быть 4-значное");
    socket.emit("setSecret", { roomId: room, number: secret, name });
    setSecretSet(true);
  };
  const makeGuess = () => {
    if (guess.length !== 4) return alert("Число должно быть 4-значное");
    socket.emit("makeGuess", { roomId: room, guess });
    setGuess("");
  };

  const goBack = () => {
    setRoom("");
    setConnected(false);
    setOtherName("");
    setSecret("");
    setSecretSet(false);
    setTurn(null);
    setMessages([]);
    setInputRoom("");
  };

  if (!socket) return null;

  // ------------------ Игра ------------------
  const startNewGame = () => {
    setGameOver(false);
    setWinner(null);
    setSecret("");
    setGuess("");
    setMessages([]);
    setSecretSet(false);
  };

  if (gameOver) {
    const isWinner = winner === socket.id;

    return (
      <div className="game-over-screen">
        <h1 className="game-over-title">
          {isWinner ? "🎉 Победа!" : "😢 Поражение"}
        </h1>

        <p className="game-over-subtitle">
          {isWinner
            ? "Ты угадал число первым!"
            : `${otherName} угадал(a) число раньше.`}
        </p>

        <button className="new-game-button" onClick={startNewGame}>
          Новая игра
        </button>
      </div>
    );
  }


  // ------------------ Ввод никнейма ------------------
  if (!nameEntered) {
    return (
      <div className="my-name-wrapper" style={{ padding: 40 }}>
        <h2 className="write-name">Введите свой никнейм</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={randomName}
        />
        <button
          className="SignIn-button next-button"
          onClick={() => {
            // Если пользователь не ввел ник, используем случайное имя
            if (!name) setName(randomName);
            setNameEntered(true);
          }}
        >
          Продолжить
        </button>
      </div>
    );
  }

  // ------------------ Выбор комнаты ------------------
  if (!room) {
    return (
      <div style={{ padding: 40 }}>
        <h2 className="hello-text">Привет, {name}!</h2>
        <div className="main-buttons-wrapper">
          <input
            placeholder="Код комнаты (только цифры)"
            value={inputRoom}
            onChange={handleInputRoomChange}
            className="code-room-input"
          />
          <CreateRoomButton createRoom={createRoom} />
          <SignInButton joinRoom={joinRoom} />
        </div>
      </div>
    );
  }

  // ------------------ Игровой экран ------------------
  return (
    <div className="main-continer" style={{ padding: 40 }}>
      {!connected && <>
        <h3 className="room-name">ID Игры: <span>{room}</span></h3>
        <BackButton goBack={goBack}/>
      </>}

      {/* Кнопка назад */}

      {/* Сообщение о сопернике */}
      {connected && otherName ? (
        <h3 className="play-with-you-text">С вами играет: {otherName}</h3>
      ) : (
        <div className="waiting-paleyers">
          <p className="waiting-text">Ожидание второго игрока...</p>

          <div className="ai-matrix-loader">
            <div className="digit">9</div>
            <div className="digit">5</div>
            <div className="digit">3</div>
            <div className="digit">7</div>
            <div className="digit">4</div>
            <div className="digit">2</div>
            <div className="digit">4</div>
            <div className="digit">1</div>
            <div className="glow"></div>
          </div>
        </div>
      )}

      {/* Показываем своё число */}
      {secretSet && (
        <p className="my-code">Мое загаданное число: <strong>{secret}</strong></p>
      )}

      {/* Загадывание числа — показываем только когда оба игрока подключены */}
      {connected && !secretSet && (
        <div className="my-name-wrapper">
          <input
            className="input-my-code"
            placeholder="Загадайте 4-значное число"
            value={secret}
            onChange={handleSecretChange}
          />
          <MakeButton sendSecret={sendSecret} text={'Начать'}/>
        </div>
      )}

      {/* Игровой ход */}
      {connected && secretSet && (
        <div className="step-wrapper">
          {turn === socket.id ? (
            <>
              <h4 className="who-move">Твой ход</h4>
              <input
                className="input-my-step"
                placeholder="Введите число"
                value={guess}
                onChange={handleGuessChange}
              />
              <MakeButton sendSecret={makeGuess} text={'Проверить'}/>
            </>
          ) : (
            <div className="step-wrapper inactive">
              <>
                <h4 className="who-move">Ход {otherName}</h4>
                <input
                  className="input-my-step"
                  placeholder="Ждём свой ход"
                  value={guess}
                  onChange={handleGuessChange}
                  disabled
                />
                <MakeButton sendSecret={() => {}} text={'Проверить'}/>
              </>
          </div>
          )}
        </div>
      )}

      {/* Разделение ходов на две колонки */}
      {connected && messages.length > 0 && (
      <div className="columns-wrapper">

        <div className="column">
          <h4 className="column-title">Мои ходы</h4>

          <div ref={myMessagesRef} className="messages">
            {messages
              .filter((m) => m.player === socket.id)
              .map((m, i) => (
                <div className="individual-step my-steps" key={i}>
                  <span>{m.guess}</span> → У: {m.result.bulls} | П: {m.result.cows}
                </div>
              ))}
          </div>
        </div>

        <div className="column">
          <h4 className="column-title">Ходы {otherName}</h4>

          <div ref={enemyMessagesRef} className="messages">
            {messages
              .filter((m) => m.player !== socket.id)
              .map((m, i) => (
                <div className="individual-step" key={i}>
                  <span>{m.guess}</span> → У: {m.result.bulls} | П: {m.result.cows}
                </div>
              ))}
          </div>
        </div>

      </div>
      )}
    </div>
  );
}