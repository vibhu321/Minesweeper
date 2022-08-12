((window, document, undefined) => {
  let bomb = [];
  let mineField = [];
  let safe = [];
  let checkedDiv,
    cols,
    flagCount,
    firstClick = true,
    idleTime,
    time,
    rows;

  const startIdleTime = () => {
    idleTime = setTimeout(animateDiv, 15000);
  };

  const stopIdleTime = () => {
    clearTimeout(idleTime);
  };

  const handleLeftClick = (e) => {
    handleClick();
    countBombs(Number(e.target.id));
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    handleClick();
    postFlag(Number(e.target.id));
  };

  const handleClick = () => {
    if (firstClick) {
      startTimer();
      firstClick = false;
    }
    stopIdleTime();
    startIdleTime();
  };

  const countBombs = (ind) => {
    const currentDiv = document.getElementById(ind);
    if (currentDiv.classList.contains("checked")) {
      return;
    } else {
      if (mineField[ind] === "bomb") {
        gameOver();
        return;
      }
      currentDiv.classList.add("checked");
      let localBombs = 0;
      let leftEdge = ind % cols === 0;
      let rightEdge = ind % cols === cols - 1;
      if (currentDiv.innerText === "🚩") {
        postFlag(ind);
      }
      if (ind > cols - 1 && mineField[ind - cols] === "bomb") {
        localBombs++;
      }
      if (
        !rightEdge &&
        ind > cols - 1 &&
        mineField[ind - cols + 1] === "bomb"
      ) {
        localBombs++;
      }
      if (!rightEdge && mineField[ind + 1] === "bomb") {
        localBombs++;
      }
      if (
        !rightEdge &&
        ind < cols * (rows - 1) &&
        mineField[ind + cols + 1] === "bomb"
      ) {
        localBombs++;
      }
      if (ind < cols * (rows - 1) && mineField[ind + cols] === "bomb") {
        localBombs++;
      }
      if (
        !leftEdge &&
        ind < cols * (rows - 1) &&
        mineField[ind + cols - 1] === "bomb"
      ) {
        localBombs++;
      }
      if (!leftEdge && mineField[ind - 1] === "bomb") {
        localBombs++;
      }
      if (!leftEdge && ind > cols - 1 && mineField[ind - cols - 1] === "bomb") {
        localBombs++;
      }
      if (safe.length === ++checkedDiv) {
        gameOver(true);
        return;
      }
      if (localBombs === 0) {
        checkNeighbour(ind, leftEdge, rightEdge);
      } else {
        document.getElementById(ind).innerHTML = localBombs;
      }
    }
  };

  const checkNeighbour = (ind, leftEdge, rightEdge) => {
    if (ind > cols - 1) {
      countBombs(ind - cols);
    }
    if (!rightEdge && ind > cols - 1) {
      countBombs(ind - cols + 1);
    }
    if (!rightEdge) {
      countBombs(ind + 1);
    }
    if (!rightEdge && ind < cols * (rows - 1)) {
      countBombs(ind + cols + 1);
    }
    if (ind < cols * (rows - 1)) {
      countBombs(ind + cols);
    }
    if (!leftEdge && ind < cols * (rows - 1)) {
      countBombs(ind + cols - 1);
    }
    if (!leftEdge) {
      countBombs(ind - 1);
    }
    if (!leftEdge && ind > cols - 1) {
      countBombs(ind - cols - 1);
    }
  };

  const postFlag = (ind) => {
    let divFlag = document.getElementById(ind);
    if (divFlag.innerText == "🚩") {
      divFlag.innerText = "";
      document.querySelector("#flag-count").innerText = ++flagCount;
    } else if (
      divFlag.innerText !== "🚩" &&
      !divFlag.classList.contains("checked")
    ) {
      divFlag.innerText = "🚩";
      document.querySelector("#flag-count").innerText = --flagCount;
    }
    checkFlags();
  };

  const checkFlags = () => {
    let correctFlagCount = 0;
    for (let i = 0; i < mineField.length; i++) {
      document.getElementById(i).innerText == "🚩" &&
        mineField[i] == "bomb" &&
        correctFlagCount++;
    }
    document.querySelector("#correct-flags").innerText = correctFlagCount;
    if (flagCount === 0) {
      if (correctFlagCount === bomb.length) gameOver(true);
      else gameOver();
    } else {
      document.querySelector(
        "#correct-flags"
      ).innerText = `${correctFlagCount} correct flag${
        correctFlagCount > 1 ? "s" : ""
      }`;
    }
  };

  const gameOver = (win = false) => {
    for (let i = 0; i < mineField.length; i++) {
      document.getElementById(i).removeEventListener("click", handleLeftClick);
      document
        .getElementById(i)
        .removeEventListener("contextmenu", handleRightClick);
      if (mineField[i] == "bomb") {
        document.getElementById(i).classList.add("bomb");
        document.getElementById(i).innerText !== "🚩" &&
          (document.getElementById(i).innerText = "💣");
      }
    }
    if (document.querySelector("#open-hint").classList.contains("open")) {
      handleHint();
    }
    stopIdleTime();
    clearInterval(time);
    displayResult(win);
  };

  const createGameGrid = () => {
    clearInterval(time);
    document.querySelector(".game-content").textContent = "";
    rows = Number(document.querySelector("#rows").value);
    cols = Number(document.querySelector("#cols").value);
    bomb.length = Math.ceil((rows * cols) / 5);
    safe.length = rows * cols - bomb.length;
    flagCount = bomb.length;
    checkedDiv = 0;
    bomb.fill("bomb");
    safe.fill("safe");
    mineField = bomb.concat(safe);
    shuffleArray(mineField);
    const parentDiv = document.querySelector(".game-content");
    parentDiv.style.width = `${cols * 44}px`;

    for (let i = 0; i < rows * cols; i++) {
      let mine = document.createElement("div");
      mine.setAttribute("id", i);
      mine.setAttribute("class", "mine");
      parentDiv.appendChild(mine);
      mine.addEventListener("click", handleLeftClick);
      mine.addEventListener("contextmenu", handleRightClick);
    }
    firstClick = true;
    handleResize();
    document.querySelector("#time").innerText = "00:00";
    document.querySelector("#flag-count").innerText = flagCount;
    document.querySelector(".modal-bg").style.display = "none";
  };

  const startTimer = () => {
    const formatTime = () => {
      let time;
      if (min < 10) {
        if (sec < 10) {
          time = `0${min}:0${sec}`;
        } else {
          time = `0${min}:${sec}`;
        }
      } else {
        if (sec < 10) {
          time = `${min}:0${sec}`;
        } else {
          time = `${min}:${sec}`;
        }
      }
      return time;
    };
    const stopWatch = () => {
      sec++;
      if (sec === 60) {
        sec = 0;
        min++;
      }
      if (min === 60) {
        createGameGrid();
        clearInterval(time);
        alert("Max time limit exceeded!");
        return;
      }
      const currTime = formatTime();
      document.querySelector("#time").innerText = currTime;
    };
    let min = 0,
      sec = 0;
    time = setInterval(stopWatch, 1000);
  };

  const shuffleArray = (arr) => {
    let currentind = arr.length,
      temporaryValue,
      randomind;
    while (0 !== currentind) {
      randomind = Math.floor(Math.random() * currentind);
      currentind -= 1;
      temporaryValue = arr[currentind];
      arr[currentind] = arr[randomind];
      arr[randomind] = temporaryValue;
    }
  };

  const handleResize = () => {
    if (
      document.querySelector(".game-content").offsetHeight <=
      document.querySelector(".game-box").offsetHeight
    ) {
      document.querySelector(".game-content").classList.add("center");
    } else {
      document.querySelector(".game-content").classList.remove("center");
    }
  };

  const handleSettings = () => {
    const openSettings = () => {
      document.querySelector("#settings-btn").classList.add("active");
      document.querySelector(".modal-bg").style.display = "flex";
      document.querySelector("#settings").style.display = "flex";
    };
    const closeSettings = () => {
      document.querySelector("#settings-btn").classList.remove("active");
      document.querySelector(".modal-bg").style.display = "none";
      document.querySelector("#settings").style.display = "none";
    };
    stopIdleTime();
    if (document.querySelector("#settings-btn").classList.contains("active")) {
      closeSettings();
    } else {
      openSettings();
    }
  };

  const displayResult = (win) => {
    if (win === true) {
      document.querySelector("#end-result").innerText = "You Win";
      document.querySelector("#time-taken").innerText = `Time taken: ${
        document.querySelector("#time").innerText
      }`;
    } else {
      document.querySelector("#end-result").innerText = "You Lose";
    }
    document.querySelector(".modal-bg").classList.add("heavy-bg");
    document.querySelector(".modal-bg").style.display = "flex";
    document.querySelector("#result").style.display = "flex";
  };

  const handleHint = () => {
    const openHint = () => {
      document.querySelector("#animate-div").classList.remove("animate");
      const dragElement = (elem) => {
        let pos1 = 0,
          pos2 = 0,
          pos3 = 0,
          pos4 = 0;
        const dragMouseDown = (e) => {
          e = e || window.event;
          e.preventDefault();
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;
        };
        const elementDrag = (e) => {
          e = e || window.event;
          e.preventDefault();
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          elem.style.top = elem.offsetTop - pos2 + "px";
          elem.style.left = elem.offsetLeft - pos1 + "px";
        };
        const closeDragElement = () => {
          document.onmouseup = null;
          document.onmousemove = null;
        };
        document.querySelector("#movable-div").onmousedown = dragMouseDown;
      };

      const moveElement = () => {
        const touchMove = (e) => {
          console.log(e.targetTouches);
          let touchLocation = e.targetTouches[0];

          document.querySelector(
            "#hint-div"
          ).style.left = `${touchLocation.pageX}px`;
          document.querySelector(
            "#hint-div"
          ).style.top = `${touchLocation.pageY}px`;
          e.stopPropagation();
        };
        document
          .querySelector("#movable-div")
          .addEventListener("touchmove", (e) => {
            touchMove(e);
            e.stopPropagation();
          });
      };

      document.querySelector("#open-hint").classList.add("open");
      checkFlags();
      clearTimeout(idleTime);
      document.querySelector("#hint-div").style.display = "block";
      dragElement(document.querySelector("#hint-div"));
      moveElement();
    };

    const closeHint = () => {
      document.querySelector("#open-hint").classList.remove("open");
      document.querySelector("#hint-div").style.display = "none";
    };

    if (document.querySelector("#open-hint").classList.contains("open")) {
      closeHint();
    } else {
      openHint();
    }
  };

  const animateDiv = () => {
    document.querySelector("#animate-div").classList.add("animate");
    setTimeout(() => {
      document.querySelector("#animate-div").classList.remove("animate");
      !firstClick && startIdleTime();
    }, 5000);
  };

  document
    .querySelector("#close-settings")
    .addEventListener("click", handleSettings);
  document
    .querySelector("#settings-btn")
    .addEventListener("click", handleSettings);
  document.querySelector("#apply-changes").addEventListener("click", () => {
    handleSettings();
    createGameGrid();
  });

  document.querySelector("#close-hint").addEventListener("click", handleHint);
  document.querySelector("#open-hint").addEventListener("click", handleHint);
  document.querySelector("#restart").addEventListener("click", () => {
    document.querySelector(".modal-bg").classList.remove("heavy-bg");
    document.querySelector(".modal-bg").style.display = "none";
    document.querySelector("#result").style.display = "none";
    createGameGrid();
  });
  window.onresize = handleResize;
  createGameGrid();
})(window, document);
