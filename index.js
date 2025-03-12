document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const userInfoSection = document.getElementById("user-info-section")
    const userInfoForm = document.getElementById("user-info-form")
    const testSection = document.getElementById("test-section")
    const resultsSection = document.getElementById("results-section")
    const questionContainer = document.getElementById("question-container")
    const questionCounter = document.getElementById("question-counter")
    const prevBtn = document.getElementById("prev-btn")
    const nextBtn = document.getElementById("next-btn")
    const submitTestBtn = document.getElementById("submit-test")
    const restartBtn = document.getElementById("restart-btn")
    const scoreSummary = document.getElementById("score-summary")
    const candidateInfoBox = document.getElementById("candidate-info-box")
    const candidateResultsInfo = document.getElementById("candidate-results-info")
    const questionList = document.getElementById("question-list")
    const flagBtn = document.getElementById("flag-btn")
    const detailedResults = document.getElementById("detailed-results")
  
    // State variables
    let currentQuestionIndex = 0
    let userInfo = {}
    const questions = []
  
    // Initialize questions
    initializeQuestions()
  
    // Event Listeners
    userInfoForm.addEventListener("submit", handleFormSubmit)
    prevBtn.addEventListener("click", goToPreviousQuestion)
    nextBtn.addEventListener("click", goToNextQuestion)
    submitTestBtn.addEventListener("click", finalSubmit) // Direct submission without warning
    restartBtn.addEventListener("click", restartTest)
    flagBtn.addEventListener("click", toggleFlagQuestion)
  
    function handleFormSubmit(e) {
      e.preventDefault()
  
      // Collect user info
      userInfo = {
        fullName: document.getElementById("fullName").value,
        dob: document.getElementById("dob").value,
        studentId: document.getElementById("studentId").value,
        class: document.getElementById("class").value,
      }
  
      // Display user info in the candidate info box
      displayCandidateInfo()
  
      // Hide user info section and show test section
      userInfoSection.classList.add("hidden")
      testSection.classList.remove("hidden")
  
      // Initialize question list
      initializeQuestionList()
  
      // Display first question
      displayQuestion(currentQuestionIndex)
    }
  
    function displayCandidateInfo() {
      const formattedDate = new Date(userInfo.dob).toLocaleDateString()
      candidateInfoBox.innerHTML = `
              <h3>Thông Tin Thí Sinh</h3>
              <p><strong>Họ và Tên:</strong> ${userInfo.fullName}</p>
              <p><strong>Mã Số Sinh Viên:</strong> ${userInfo.studentId}</p>
              <p><strong>Lớp:</strong> ${userInfo.class}</p>
              <p><strong>Ngày Sinh:</strong> ${formattedDate}</p>
          `
    }
  
    function initializeQuestionList() {
      questionList.innerHTML = ""
      questions.forEach((question, index) => {
        const button = document.createElement("button")
        button.textContent = index + 1
        button.classList.add("question-btn", "unanswered")
        button.addEventListener("click", () => {
          saveCurrentAnswer()
          currentQuestionIndex = index
          displayQuestion(currentQuestionIndex)
        })
        questionList.appendChild(button)
      })
    }
  
    function updateQuestionListStatus() {
      const buttons = questionList.querySelectorAll(".question-btn")
      buttons.forEach((button, index) => {
        const question = questions[index]
        button.classList.toggle("unanswered", !question.userAnswer)
        button.classList.toggle("answered", !!question.userAnswer)
        button.classList.toggle("flagged", question.flagged)
        button.classList.toggle("active", index === currentQuestionIndex)
      })
    }
  
    function goToPreviousQuestion() {
      if (currentQuestionIndex > 0) {
        saveCurrentAnswer()
        currentQuestionIndex--
        displayQuestion(currentQuestionIndex)
      }
    }
  
    function goToNextQuestion() {
      if (currentQuestionIndex < questions.length - 1) {
        saveCurrentAnswer()
        currentQuestionIndex++
        displayQuestion(currentQuestionIndex)
      }
    }
  
    function displayQuestion(index) {
      const question = questions[index]
  
      // Update question counter
      questionCounter.textContent = `Câu hỏi ${index + 1} / ${questions.length}`
  
      // Generate HTML based on question type
      let questionHTML = `
              <div class="question" data-index="${index}">
                  <div class="question-text">${index + 1}. ${question.text}</div>
          `
  
      if (question.type === "true-false") {
        questionHTML += `
                  <div class="options">
                      <div class="option">
                          <input type="radio" id="true-${index}" name="q${index}" value="true" ${question.userAnswer === "true" ? "checked" : ""}>
                          <label for="true-${index}">Đúng</label>
                      </div>
                      <div class="option">
                          <input type="radio" id="false-${index}" name="q${index}" value="false" ${question.userAnswer === "false" ? "checked" : ""}>
                          <label for="false-${index}">Sai</label>
                      </div>
                  </div>
              `
      } else if (question.type === "single-choice") {
        questionHTML += '<div class="options">'
        question.options.forEach((option, optIndex) => {
          questionHTML += `
                      <div class="option">
                          <input type="radio" id="q${index}-opt${optIndex}" name="q${index}" value="${optIndex}" ${question.userAnswer === optIndex.toString() ? "checked" : ""}>
                          <label for="q${index}-opt${optIndex}">${option}</label>
                      </div>
                  `
        })
        questionHTML += "</div>"
      } else if (question.type === "multiple-choice") {
        questionHTML += '<div class="options">'
        question.options.forEach((option, optIndex) => {
          const isChecked = question.userAnswer && question.userAnswer.includes(optIndex.toString())
          questionHTML += `
                      <div class="option">
                          <input type="checkbox" id="q${index}-opt${optIndex}" name="q${index}" value="${optIndex}" ${isChecked ? "checked" : ""}>
                          <label for="q${index}-opt${optIndex}">${option}</label>
                      </div>
                  `
        })
        questionHTML += "</div>"
      } else if (question.type === "essay") {
        questionHTML += `
                  <textarea class="essay-answer" id="essay-${index}" placeholder="Nhập câu trả lời của bạn tại đây...">${question.userAnswer || ""}</textarea>
              `
      }
  
      questionHTML += "</div>"
  
      // Update the question container
      questionContainer.innerHTML = questionHTML
  
      // Update navigation buttons
      prevBtn.disabled = index === 0
      nextBtn.disabled = index === questions.length - 1
  
      // Update question list status
      updateQuestionListStatus()
  
      // Update flag button
      updateFlagButton()
    }
  
    function saveCurrentAnswer() {
      const question = questions[currentQuestionIndex]
  
      if (question.type === "true-false") {
        const trueRadio = document.getElementById(`true-${currentQuestionIndex}`)
        const falseRadio = document.getElementById(`false-${currentQuestionIndex}`)
  
        if (trueRadio && trueRadio.checked) {
          question.userAnswer = "true"
        } else if (falseRadio && falseRadio.checked) {
          question.userAnswer = "false"
        } else {
          question.userAnswer = null
        }
      } else if (question.type === "single-choice") {
        const selectedOption = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`)
        question.userAnswer = selectedOption ? selectedOption.value : null
      } else if (question.type === "multiple-choice") {
        const selectedOptions = document.querySelectorAll(`input[name="q${currentQuestionIndex}"]:checked`)
        question.userAnswer = selectedOptions.length > 0 ? Array.from(selectedOptions).map((opt) => opt.value) : null
      } else if (question.type === "essay") {
        const essayAnswer = document.getElementById(`essay-${currentQuestionIndex}`)
        question.userAnswer = essayAnswer && essayAnswer.value.trim() !== "" ? essayAnswer.value : null
      }
  
      updateQuestionListStatus()
    }
  
    function finalSubmit() {
      saveCurrentAnswer()
  
      // Calculate score
      calculateScore()
  
      // Hide test section and show results section
      testSection.classList.add("hidden")
      resultsSection.classList.remove("hidden")
  
      // Display candidate info in results
      displayCandidateResultsInfo()
  
      // Display detailed results
      displayDetailedResults()
    }
  
    function calculateScore() {
      let correctCount = 0
      let totalGradable = 0
  
      // Only count the first 30 questions (excluding essays)
      questions.slice(0, 30).forEach((question) => {
        totalGradable++
  
        if (isAnswerCorrect(question)) {
          correctCount++
          question.isCorrect = true
        } else {
          question.isCorrect = false
        }
      })
  
      // Mark essay questions as not gradable automatically
      questions.slice(30).forEach((question) => {
        question.isCorrect = null // null means "not automatically gradable"
      })
  
      // Calculate percentage
      const percentage = Math.round((correctCount / totalGradable) * 100)
  
      // Store score in userInfo
      userInfo.score = {
        correct: correctCount,
        total: totalGradable,
        percentage: percentage,
      }
  
      // Display score summary
      scoreSummary.innerHTML = `
              <h3>Tổng Kết Điểm</h3>
              <div class="score-highlight">${correctCount} / ${totalGradable} (${percentage}%)</div>
              <p>Đúng/Sai: ${countCorrectByType("true-false")} / 10</p>
              <p>Trắc Nghiệm Đơn: ${countCorrectByType("single-choice")} / 10</p>
              <p>Trắc Nghiệm Nhiều Lựa Chọn: ${countCorrectByType("multiple-choice")} / 10</p>
              <p>Câu hỏi tự luận sẽ được chấm điểm thủ công.</p>
          `
    }
  
    function countCorrectByType(type) {
      return questions.filter((q) => q.type === type && q.isCorrect === true).length
    }
  
    function isAnswerCorrect(question) {
      if (!question.userAnswer) return false
  
      if (question.type === "true-false" || question.type === "single-choice") {
        return question.userAnswer === question.correctAnswer
      } else if (question.type === "multiple-choice") {
        // For multiple choice, check if arrays have the same elements
        const userAnswers = question.userAnswer.sort()
        const correctAnswers = question.correctAnswer.sort()
  
        if (userAnswers.length !== correctAnswers.length) return false
  
        for (let i = 0; i < userAnswers.length; i++) {
          if (userAnswers[i] !== correctAnswers[i]) return false
        }
  
        return true
      }
  
      return false // For essay questions
    }
  
    function displayCandidateResultsInfo() {
      const formattedDate = new Date(userInfo.dob).toLocaleDateString()
      candidateResultsInfo.innerHTML = `
              <h3>Thông Tin Thí Sinh</h3>
              <p><strong>Họ và Tên:</strong> ${userInfo.fullName}</p>
              <p><strong>Mã Số Sinh Viên:</strong> ${userInfo.studentId}</p>
              <p><strong>Lớp:</strong> ${userInfo.class}</p>
              <p><strong>Ngày Sinh:</strong> ${formattedDate}</p>
          `
    }
  
    function displayDetailedResults() {
      detailedResults.innerHTML = "<h3>Kết Quả Chi Tiết</h3>"
  
      questions.forEach((question, index) => {
        const resultItem = document.createElement("div")
        resultItem.className = "result-item"
  
        // Determine status class and text
        let statusClass = ""
        let statusText = ""
  
        if (question.type === "essay") {
          statusClass = "status-essay"
          statusText = "Tự Luận"
        } else if (question.isCorrect) {
          statusClass = "status-correct"
          statusText = "Đúng"
        } else {
          statusClass = "status-incorrect"
          statusText = "Sai"
        }
  
        let resultHTML = `
                  <h3>
                      Câu hỏi ${index + 1}
                      <span class="result-status ${statusClass}">${statusText}</span>
                  </h3>
                  <p>${question.text}</p>
              `
  
        if (question.type === "true-false") {
          resultHTML += `
                  <div class="answer-comparison">
                      <div class="answer-column correct-column">
                          <h4>Đáp Án Đúng:</h4>
                          <p>${question.correctAnswer === "true" ? "Đúng" : "Sai"}</p>
                      </div>
                      <div class="answer-column user-column">
                          <h4>Câu Trả Lời Của Bạn:</h4>
                          <p class="${question.isCorrect ? "correct-answer" : "incorrect-answer"}">
                              ${question.userAnswer === "true" ? "Đúng" : question.userAnswer === "false" ? "Sai" : "Chưa trả lời"}
                          </p>
                      </div>
                  </div>
                  `
        } else if (question.type === "single-choice") {
          const correctOptionIndex = Number.parseInt(question.correctAnswer)
          const userOptionIndex = question.userAnswer ? Number.parseInt(question.userAnswer) : -1
  
          resultHTML += `
                  <div class="answer-comparison">
                      <div class="answer-column correct-column">
                          <h4>Đáp Án Đúng:</h4>
                          <p>${question.options[correctOptionIndex]}</p>
                      </div>
                      <div class="answer-column user-column">
                          <h4>Câu Trả Lời Của Bạn:</h4>
                          <p class="${question.isCorrect ? "correct-answer" : "incorrect-answer"}">
                              ${userOptionIndex >= 0 ? question.options[userOptionIndex] : "Chưa trả lời"}
                          </p>
                      </div>
                  </div>
                  `
        } else if (question.type === "multiple-choice") {
          const correctIndices = question.correctAnswer.map((i) => Number.parseInt(i))
          const userIndices = question.userAnswer ? question.userAnswer.map((i) => Number.parseInt(i)) : []
  
          resultHTML += `
                  <div class="answer-comparison">
                      <div class="answer-column correct-column">
                          <h4>Đáp Án Đúng:</h4>
                          <ul>
                  `
  
          correctIndices.forEach((index) => {
            resultHTML += `<li>${question.options[index]}</li>`
          })
  
          resultHTML += `
                          </ul>
                      </div>
                      <div class="answer-column user-column">
                          <h4>Câu Trả Lời Của Bạn:</h4>
                  `
  
          if (userIndices.length > 0) {
            resultHTML += "<ul>"
            userIndices.forEach((index) => {
              const isCorrect = correctIndices.includes(index)
              resultHTML += `<li class="${isCorrect ? "correct-answer" : "incorrect-answer"}">${question.options[index]}</li>`
            })
            resultHTML += "</ul>"
          } else {
            resultHTML += '<p class="incorrect-answer">Chưa trả lời</p>'
          }
  
          resultHTML += `
                      </div>
                  </div>
                  `
        } else if (question.type === "essay") {
          resultHTML += `
                  <div class="answer-column user-column">
                      <h4>Câu Trả Lời Của Bạn:</h4>
                      <p>${question.userAnswer || "Chưa trả lời"}</p>
                      <p><em>Câu hỏi tự luận sẽ được chấm điểm thủ công.</em></p>
                  </div>
                  `
        }
  
        resultItem.innerHTML = resultHTML
        detailedResults.appendChild(resultItem)
      })
    }
  
    function restartTest() {
      // Reset state
      currentQuestionIndex = 0
      userInfo = {}
  
      // Reset questions (clear user answers)
      questions.forEach((q) => {
        q.userAnswer = null
        q.flagged = false
        q.isCorrect = undefined
      })
  
      // Reset form
      userInfoForm.reset()
  
      // Clear candidate info box
      candidateInfoBox.innerHTML = ""
  
      // Show user info section, hide other sections
      userInfoSection.classList.remove("hidden")
      testSection.classList.add("hidden")
      resultsSection.classList.add("hidden")
    }
  
    function initializeQuestions() {
      // Group 1: True/False questions
      questions.push(
        {
          text: `Có một loại sứa được gọi là "sứa bất tử" có khả năng trẻ hóa và sống vĩnh viễn nếu không bị ăn thịt hoặc gặp tai nạn.`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: "true"
        },
        {
          text: `Trên sao Hỏa, một ngày dài hơn một ngày trên Trái Đất.`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: "true"
        },
        {
          text: `Loài rùa có thể thở bằng hậu môn.`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: "true"
        },
        {
          text: `Người ta đã tìm thấy bằng chứng về sự sống ngoài hành tinh trên một thiên thạch rơi xuống Trái Đất.`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: "false"
        },
        {
          text: `Trên thực tế, con người chỉ sử dụng 10% bộ não của mình.`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: "false"
        },
        {
          text: `Nếu bạn hét trong 8 năm liên tục, bạn có thể tạo ra đủ năng lượng để đun sôi một tách trà.`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: "true"
        },
        {
          text: `Một ngày ở sao Kim ngắn hơn một ngày trên Trái Đất.`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: "false"
        },
        {
          text: `Chó có thể nhìn thấy tất cả các màu giống như con người.`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: "false"
        },
        {
          text: `Ở một số vùng của Canada, trọng lực yếu hơn những nơi khác trên Trái Đất.`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: "true"
        },
        {
          text: `Nếu bạn rơi vào một hố đen, bạn sẽ ngay lập tức bị nghiền nát.`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: "false"
        }
      );      
  
      // Group 2: Single-choice questions
      questions.push({
        text: `Loài nào có thể sống mà không cần đầu trong nhiều ngày?`,
        type: "single-choice",
        options: [
          "Gà",
          "Cá vàng",
          "Rắn",
          "Bọ cạp"
        ],
        userAnswer: null,
        correctAnswer: "0"
      });
      
      questions.push({
        text: `Loài nào có tim nằm trong đầu?`,
        type: "single-choice",
        options: [
          "Mực",
          "Tôm",
          "Ếch",
          "Kiến"
        ],
        userAnswer: null,
        correctAnswer: "1"
      });
      
      questions.push({
        text: `Loài nào có thể tái sinh toàn bộ cơ thể từ một mảnh nhỏ?`,
        type: "single-choice",
        options: [
          "Rắn",
          "Thằn lằn",
          "Sao biển",
          "Sứa"
        ],
        userAnswer: null,
        correctAnswer: "2"
      });
      
      questions.push({
        text: `Loài nào có số lượng não nhiều nhất?`,
        type: "single-choice",
        options: [
          "Cá voi",
          "Bạch tuộc",
          "Kiến",
          "Chó"
        ],
        userAnswer: null,
        correctAnswer: "1"
      });
      
      questions.push({
        text: `Loài nào có thể đóng băng hoàn toàn vào mùa đông và sống lại vào mùa xuân?`,
        type: "single-choice",
        options: [
          "Ếch gỗ",
          "Chuột chù",
          "Gấu Bắc Cực",
          "Dơi"
        ],
        userAnswer: null,
        correctAnswer: "0"
      });
      
      questions.push({
        text: `Loài nào có thể sống trong không gian mà không cần bộ đồ bảo vệ?`,
        type: "single-choice",
        options: [
          "Gián",
          "Gấu nước",
          "Kiến lửa",
          "Nhện"
        ],
        userAnswer: null,
        correctAnswer: "1"
      });
      
      questions.push({
        text: `Loài động vật nào có thể sống lâu nhất?`,
        type: "single-choice",
        options: [
          "Cá voi xanh",
          "Sứa bất tử",
          "Cá mập Greenland",
          "Rùa khổng lồ"
        ],
        userAnswer: null,
        correctAnswer: "1"
      });
      
      questions.push({
        text: `Loài vật nào có thể phát sáng trong bóng tối nhờ khả năng sinh học?`,
        type: "single-choice",
        options: [
          "Bạch tuộc",
          "Nấm mật ong",
          "Mực ma cà rồng",
          "Sao biển phát sáng"
        ],
        userAnswer: null,
        correctAnswer: "2"
      });
      
      questions.push({
        text: `Loài động vật nào có thể sống sót sau khi bị đun sôi trong nước?`,
        type: "single-choice",
        options: [
          "Gián",
          "Gấu nước",
          "Cá sấu",
          "Nhện nước"
        ],
        userAnswer: null,
        correctAnswer: "1"
      });
      
      questions.push({
        text: `Loài nào có thể tự biến đổi giới tính trong suốt vòng đời của mình?`,
        type: "single-choice",
        options: [
          "Ếch phi tiêu độc",
          "Cá hề",
          "Bạch tuộc",
          "Rắn lục"
        ],
        userAnswer: null,
        correctAnswer: "1"
      });      

      // Group 3: Multiple-choice questions
      questions.push({
        text: `Những nơi nào trên Trái Đất có thể tạo ra cực quang?`,
        type: "multiple-choice",
        options: [
          "Nam Cực",
          "Bắc Cực",
          "Xích đạo",
          "Sa mạc Sahara"
        ],
        userAnswer: null,
        correctAnswer: ["0", "1"]
      });
      
      questions.push({
        text: `Những yếu tố nào có thể tạo ra sấm sét?`,
        type: "multiple-choice",
        options: [
          "Bão lớn",
          "Núi lửa phun trào",
          "Bão mặt trời",
          "Tảo biển phát sáng"
        ],
        userAnswer: null,
        correctAnswer: ["0", "1", "2"]
      });
      
      questions.push({
        text: `Những loài động vật nào có thể phát sáng tự nhiên?`,
        type: "multiple-choice",
        options: [
          "Mực ma cà rồng",
          "Đom đóm",
          "Cá mập ma",
          "Hải quỳ"
        ],
        userAnswer: null,
        correctAnswer: ["0", "1", "3"]
      });
      
      questions.push({
        text: `Những nơi nào trên Trái Đất có thể xuất hiện hiện tượng mưa động vật?`,
        type: "multiple-choice",
        options: [
          "Úc",
          "Mỹ",
          "Mexico",
          "Pháp"
        ],
        userAnswer: null,
        correctAnswer: ["0", "2"]
      });
      
      questions.push({
        text: `Những hành tinh nào trong Hệ Mặt Trời có thể có mưa kim cương?`,
        type: "multiple-choice",
        options: [
          "Sao Mộc",
          "Sao Thổ",
          "Sao Thiên Vương",
          "Sao Hải Vương"
        ],
        userAnswer: null,
        correctAnswer: ["1", "2", "3"]
      });
      
      questions.push({
        text: `Những hiện tượng tự nhiên nào có thể xuất hiện trong tam giác quỷ Bermuda?`,
        type: "multiple-choice",
        options: [
          "Bão mạnh",
          "Sóng thần",
          "Nước xoáy khổng lồ",
          "Hiện tượng từ trường bất thường"
        ],
        userAnswer: null,
        correctAnswer: ["0", "2", "3"]
      });
      
      questions.push({
        text: `Những yếu tố nào có thể gây ra hiệu ứng nhà kính?`,
        type: "multiple-choice",
        options: [
          "Khí CO2",
          "Khí CH4",
          "Khí O2",
          "Hơi nước"
        ],
        userAnswer: null,
        correctAnswer: ["0", "1", "3"]
      });
      
      questions.push({
        text: `Những nguyên nhân nào có thể gây ra sóng thần?`,
        type: "multiple-choice",
        options: [
          "Động đất dưới biển",
          "Núi lửa phun trào",
          "Thiên thạch rơi",
          "Áp suất khí quyển giảm đột ngột"
        ],
        userAnswer: null,
        correctAnswer: ["0", "1", "2"]
      });
      
      questions.push({
        text: `Những hiện tượng tự nhiên nào có thể gây ra cầu vồng lửa?`,
        type: "multiple-choice",
        options: [
          "Ánh sáng mặt trời",
          "Mây ti tầng",
          "Hơi nước từ biển",
          "Tinh thể băng trong khí quyển"
        ],
        userAnswer: null,
        correctAnswer: ["0", "3"]
      });
      
      questions.push({
        text: `Những dạng sét nào có thể tồn tại?`,
        type: "multiple-choice",
        options: [
          "Sét hòn",
          "Sét xanh",
          "Sét khô",
          "Sét nhiệt đới"
        ],
        userAnswer: null,
        correctAnswer: ["0", "1", "2"]
      });      
  
      // Group 4: Essay questions
      questions.push({
        text: `Giải thích về sự biến mất bí ẩn của nền văn minh Maya. Có những giả thuyết nào về nguyên nhân dẫn đến sự suy tàn của họ?`,
        type: "essay",
        userAnswer: null
      });
      
      questions.push({
        text: `Tam giác quỷ Bermuda là một trong những bí ẩn lớn nhất thế giới. Bạn nghĩ đâu là nguyên nhân thực sự dẫn đến các vụ mất tích tại khu vực này?`,
        type: "essay",
        userAnswer: null
      });
      
      questions.push({
        text: `Xác ướp của hoàng đế Tần Thủy Hoàng được cho là được bảo vệ bởi hệ thống bẫy chết chóc. Bạn có tin rằng có một cung điện ngầm khổng lồ bên dưới không?`,
        type: "essay",
        userAnswer: null
      });
      
      questions.push({
        text: `Vụ mất tích của Amelia Earhart vẫn là một trong những bí ẩn lớn của ngành hàng không. Theo bạn, điều gì đã thực sự xảy ra với bà?`,
        type: "essay",
        userAnswer: null
      });
      
      questions.push({
        text: `Hòn đá Rosetta có vai trò như thế nào trong việc giải mã chữ viết của người Ai Cập cổ đại?`,
        type: "essay",
        userAnswer: null
      });
      
      questions.push({
        text: `Hiện tượng "bước chân quỷ" xuất hiện tại Anh vào năm 1855 đã gây hoang mang cho nhiều người. Bạn có lý giải khoa học nào cho hiện tượng này không?`,
        type: "essay",
        userAnswer: null
      });
      
      questions.push({
        text: `Thành phố Atlantis được nhắc đến trong nhiều tài liệu cổ đại. Theo bạn, Atlantis thực sự tồn tại hay chỉ là huyền thoại?`,
        type: "essay",
        userAnswer: null
      });
      
      questions.push({
        text: `Các bức tượng Moai trên đảo Phục Sinh được di chuyển bằng cách nào? Liệu có công nghệ nào của người cổ đại mà chúng ta chưa khám phá ra không?`,
        type: "essay",
        userAnswer: null
      });
      
      questions.push({
        text: `Bí ẩn về "Người đàn ông trong mặt nạ sắt" đã khiến nhiều nhà sử học đau đầu. Bạn nghĩ danh tính thực sự của ông ta là ai?`,
        type: "essay",
        userAnswer: null
      });
      
      questions.push({
        text: `Nhiều người tin rằng kho báu của cướp biển khét tiếng Blackbeard vẫn chưa được tìm thấy. Nếu bạn là một nhà thám hiểm, bạn sẽ tìm kiếm nó ở đâu và bằng cách nào?`,
        type: "essay",
        userAnswer: null
      });      
  
      // Add 'flagged' property to each question
      questions.forEach((question) => {
        question.flagged = false
      })
    }
  
    function toggleFlagQuestion() {
      const currentQuestion = questions[currentQuestionIndex]
      currentQuestion.flagged = !currentQuestion.flagged
      updateQuestionListStatus()
      updateFlagButton()
    }
  
    function updateFlagButton() {
      const currentQuestion = questions[currentQuestionIndex]
      flagBtn.classList.toggle("flagged", currentQuestion.flagged)
      flagBtn.textContent = currentQuestion.flagged ? "Bỏ Đánh Dấu" : "Đánh Dấu Câu Hỏi"
    }
  })  