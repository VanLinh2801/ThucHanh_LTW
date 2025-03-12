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
            <h3>Thông Tin Người Dùng</h3>
            <p><strong>Họ và Tên:</strong> ${userInfo.fullName}</p>
            <p><strong>Số Căn Cước Công Dân:</strong> ${userInfo.studentId}</p>
            <p><strong>Địa Chỉ Thường Trú:</strong> ${userInfo.class}</p>
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
                        <label for="true-${index}">Có</label>
                    </div>
                    <div class="option">
                        <input type="radio" id="false-${index}" name="q${index}" value="false" ${question.userAnswer === "false" ? "checked" : ""}>
                        <label for="false-${index}">Không</label>
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

  // Modify the displayDetailedResults function to only show user answers
  function displayDetailedResults() {
    detailedResults.innerHTML = "<h3>Kết Quả Chi Tiết</h3>"

    questions.forEach((question, index) => {
      const resultItem = document.createElement("div")
      resultItem.className = "result-item"

      let resultHTML = `
            <h3>Câu hỏi ${index + 1}</h3>
            <p>${question.text}</p>
        `

      if (question.type === "true-false") {
        resultHTML += `
            <div class="answer-column user-column">
                <h4>Câu Trả Lời Của Bạn:</h4>
                <p>${question.userAnswer === "true" ? "Có" : question.userAnswer === "false" ? "Không" : "Chưa trả lời"}</p>
            </div>
            `
      } else if (question.type === "single-choice") {questions.push(
        {
            text: `Bạn có thể mô tả một trải nghiệm mua sắm hàng tiêu dùng gần đây mà bạn cảm thấy hài lòng? Điều gì làm bạn thích thú?`,
            type: "essay",
            userAnswer: null
        },
        {
            text: `Theo bạn, yếu tố nào quan trọng nhất khi lựa chọn một sản phẩm tiêu dùng? Giải thích lý do tại sao.`,
            type: "essay",
            userAnswer: null
        },
        {
            text: `Bạn có thói quen mua sắm hàng tiêu dùng như thế nào? Bạn thường mua theo kế hoạch hay ngẫu hứng?`,
            type: "essay",
            userAnswer: null
        },
        {
            text: `Bạn nghĩ thế nào về các sản phẩm tiêu dùng thân thiện với môi trường? Bạn có sẵn sàng trả giá cao hơn để sử dụng chúng không?`,
            type: "essay",
            userAnswer: null
        },
        {
            text: `Hãy kể về một lần bạn cảm thấy không hài lòng khi mua hàng tiêu dùng. Nguyên nhân do đâu?`,
            type: "essay",
            userAnswer: null
        },
        {
            text: `Bạn có thường xuyên mua hàng tiêu dùng trực tuyến không? Những lợi ích và hạn chế của hình thức này là gì theo bạn?`,
            type: "essay",
            userAnswer: null
        },
        {
            text: `Theo bạn, những chương trình khuyến mãi có ảnh hưởng lớn đến quyết định mua hàng tiêu dùng của bạn không? Tại sao?`,
            type: "essay",
            userAnswer: null
        },
        {
            text: `Bạn có ưu tiên sử dụng hàng nội địa hay hàng nhập khẩu không? Lý do của bạn là gì?`,
            type: "essay",
            userAnswer: null
        },
        {
            text: `Bạn có từng thay đổi thương hiệu một sản phẩm tiêu dùng mà bạn đã sử dụng lâu dài chưa? Nếu có, lý do là gì?`,
            type: "essay",
            userAnswer: null
        },
        {
            text: `Theo bạn, xu hướng tiêu dùng hiện nay có thay đổi so với 5 năm trước không? Những yếu tố nào tác động đến sự thay đổi đó?`,
            type: "essay",
            userAnswer: null
        }
    );
    
        const userOptionIndex = question.userAnswer ? Number.parseInt(question.userAnswer) : -1

        resultHTML += `
            <div class="answer-column user-column">
                <h4>Câu Trả Lời Của Bạn:</h4>
                <p>${userOptionIndex >= 0 ? question.options[userOptionIndex] : "Chưa trả lời"}</p>
            </div>
            `
      } else if (question.type === "multiple-choice") {
        const userIndices = question.userAnswer ? question.userAnswer.map((i) => Number.parseInt(i)) : []

        resultHTML += `
            <div class="answer-column user-column">
                <h4>Câu Trả Lời Của Bạn:</h4>
            `

        if (userIndices.length > 0) {
          resultHTML += "<ul>"
          userIndices.forEach((index) => {
            resultHTML += `<li>${question.options[index]}</li>`
          })
          resultHTML += "</ul>"
        } else {
          resultHTML += "<p>Chưa trả lời</p>"
        }

        resultHTML += `
            </div>
            `
      } else if (question.type === "essay") {
        resultHTML += `
            <div class="answer-column user-column">
                <h4>Câu Trả Lời Của Bạn:</h4>
                <p>${question.userAnswer || "Chưa trả lời"}</p>
                <p><em>Câu hỏi tự luận sẽ được kiểm tra thủ công.</em></p>
            </div>
            `
      }

      resultItem.innerHTML = resultHTML
      detailedResults.appendChild(resultItem)
    })
  }

  // Modify the calculateScore function to remove score display
  function calculateScore() {
    // We still need to calculate scores internally for future use
    // but we won't display them

    // Only count the first 30 questions (excluding essays)
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

    // Display only submission summary without scores
    scoreSummary.innerHTML = `
        <h3>Thông Tin Bài Làm</h3>
        <p>Đúng/Sai: ${countAnsweredByType("true-false")} / 10 câu đã trả lời</p>
        <p>Trắc Nghiệm Đơn: ${countAnsweredByType("single-choice")} / 10 câu đã trả lời</p>
        <p>Trắc Nghiệm Nhiều Lựa Chọn: ${countAnsweredByType("multiple-choice")} / 10 câu đã trả lời</p>
        <p>Tự Luận: ${countAnsweredByType("essay")} / 10 câu đã trả lời</p>
    `
  }

  // Add a new function to count answered questions by type
  function countAnsweredByType(type) {
    return questions.filter((q) => q.type === type && q.userAnswer !== null).length
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
            <h3>Thông Tin Người Thực Hiện Khảo Sát</h3>
            <p><strong>Họ và Tên:</strong> ${userInfo.fullName}</p>
            <p><strong>Số Căn Cước Công Dân:</strong> ${userInfo.studentId}</p>
            <p><strong>Địa Chỉ Thường Trú:</strong> ${userInfo.class}</p>
            <p><strong>Ngày Sinh:</strong> ${formattedDate}</p>
        `
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
          text: `Bạn có thường xuyên đọc nhãn thành phần trước khi mua sản phẩm tiêu dùng không?`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn có ưu tiên mua các sản phẩm từ thương hiệu mà bạn đã quen thuộc không?`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn có sẵn sàng trả giá cao hơn để mua các sản phẩm hữu cơ hoặc thân thiện với môi trường không?`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn có thường xuyên mua hàng tiêu dùng theo các chương trình khuyến mãi hay giảm giá không?`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn có tin rằng thương hiệu nổi tiếng luôn đảm bảo chất lượng tốt hơn so với thương hiệu ít tên tuổi không?`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn có ưu tiên lựa chọn sản phẩm có nguồn gốc xuất xứ rõ ràng không?`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn có thường so sánh giá cả giữa các cửa hàng trước khi quyết định mua sản phẩm tiêu dùng không?`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn có cảm thấy quảng cáo ảnh hưởng đến quyết định mua hàng của bạn không?`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn có thường xuyên thử các sản phẩm mới thay vì mua lại những sản phẩm quen thuộc không?`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn có quan tâm đến đánh giá của người dùng khác khi chọn mua sản phẩm tiêu dùng không?`,
          type: "true-false",
          userAnswer: null,
          correctAnswer: null
      }
  );  

    // Group 2: Single-choice questions
    questions.push(
      {
          text: `Bạn thường mua sản phẩm tiêu dùng ở đâu nhiều nhất?`,
          type: "single-choice",
          options: [
              `Siêu thị`,
              `Chợ truyền thống`,
              `Cửa hàng tiện lợi`,
              `Mua sắm online`
          ],
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Yếu tố nào quan trọng nhất khi bạn chọn mua một sản phẩm tiêu dùng?`,
          type: "single-choice",
          options: [
              `Giá cả`,
              `Chất lượng`,
              `Thương hiệu`,
              `Đánh giá từ người khác`
          ],
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn thường mua hàng tiêu dùng với tần suất như thế nào?`,
          type: "single-choice",
          options: [
              `Hàng ngày`,
              `Hàng tuần`,
              `Hàng tháng`,
              `Khi cần mới mua`
          ],
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn có xu hướng mua sản phẩm theo tiêu chí nào?`,
          type: "single-choice",
          options: [
              `Sản phẩm có thương hiệu nổi tiếng`,
              `Sản phẩm có giá rẻ hơn`,
              `Sản phẩm có thành phần tự nhiên`,
              `Sản phẩm được khuyến mãi`
          ],
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Khi mua sản phẩm tiêu dùng, bạn quan tâm nhất đến thông tin nào trên nhãn?`,
          type: "single-choice",
          options: [
              `Thành phần`,
              `Hạn sử dụng`,
              `Xuất xứ`,
              `Giá cả`
          ],
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn có xu hướng mua sản phẩm đóng gói với dung tích/lượng như thế nào?`,
          type: "single-choice",
          options: [
              `Loại nhỏ tiện lợi`,
              `Loại trung bình phổ biến`,
              `Loại lớn tiết kiệm`,
              `Tùy vào nhu cầu từng lần mua`
          ],
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Khi sản phẩm yêu thích hết hàng, bạn sẽ làm gì?`,
          type: "single-choice",
          options: [
              `Mua sản phẩm thay thế cùng loại`,
              `Chờ hàng về rồi mua`,
              `Tìm cửa hàng khác để mua`,
              `Mua một sản phẩm khác hoàn toàn`
          ],
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn thường mua hàng tiêu dùng vào thời điểm nào?`,
          type: "single-choice",
          options: [
              `Sáng sớm`,
              `Giữa ngày`,
              `Buổi tối`,
              `Cuối tuần`
          ],
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Khi có chương trình khuyến mãi, bạn có xu hướng như thế nào?`,
          type: "single-choice",
          options: [
              `Mua nhiều hơn để dự trữ`,
              `Chỉ mua nếu cần thiết`,
              `So sánh giá kỹ trước khi quyết định`,
              `Không quan tâm đến khuyến mãi`
          ],
          userAnswer: null,
          correctAnswer: null
      },
      {
          text: `Bạn thường mua hàng tiêu dùng theo cách nào?`,
          type: "single-choice",
          options: [
              `Lên danh sách trước`,
              `Mua ngẫu nhiên theo nhu cầu`,
              `Dựa trên quảng cáo hoặc giới thiệu`,
              `Dựa trên khuyến mãi hoặc giảm giá`
          ],
          userAnswer: null,
          correctAnswer: null
      }
  );  

    // Group 3: Multiple-choice questions
    questions.push(
      {
          text: `Bạn thường mua những loại sản phẩm tiêu dùng nào nhiều nhất? Chọn tất cả các câu trả lời đúng.`,
          type: "multiple-choice",
          options: [
              `Thực phẩm và đồ uống`,
              `Sản phẩm chăm sóc cá nhân`,
              `Hóa phẩm và chất tẩy rửa`,
              `Đồ gia dụng`
          ],
          userAnswer: null,
          correctAnswer: ["0", "1"]
      },
      {
          text: `Bạn quan tâm đến những yếu tố nào khi mua hàng tiêu dùng? Chọn tất cả các câu trả lời đúng.`,
          type: "multiple-choice",
          options: [
              `Giá cả hợp lý`,
              `Chất lượng sản phẩm`,
              `Thương hiệu uy tín`,
              `Đánh giá của người khác`
          ],
          userAnswer: null,
          correctAnswer: ["1", "2"]
      },
      {
          text: `Những kênh nào bạn thường sử dụng để tìm hiểu về sản phẩm tiêu dùng? Chọn tất cả các câu trả lời đúng.`,
          type: "multiple-choice",
          options: [
              `Mạng xã hội`,
              `Quảng cáo truyền hình`,
              `Trải nghiệm thực tế`,
              `Người quen giới thiệu`
          ],
          userAnswer: null,
          correctAnswer: ["0", "3"]
      },
      {
          text: `Những chương trình khuyến mãi nào khiến bạn quyết định mua hàng? Chọn tất cả các câu trả lời đúng.`,
          type: "multiple-choice",
          options: [
              `Giảm giá trực tiếp`,
              `Tặng kèm sản phẩm`,
              `Mua 1 tặng 1`,
              `Điểm thưởng đổi quà`
          ],
          userAnswer: null,
          correctAnswer: ["0", "2"]
      },
      {
          text: `Bạn thường sử dụng những phương thức thanh toán nào khi mua hàng tiêu dùng? Chọn tất cả các câu trả lời đúng.`,
          type: "multiple-choice",
          options: [
              `Tiền mặt`,
              `Thẻ ngân hàng`,
              `Ví điện tử`,
              `Trả góp`
          ],
          userAnswer: null,
          correctAnswer: ["1", "2"]
      },
      {
          text: `Bạn quan tâm đến những yếu tố nào khi chọn thương hiệu sản phẩm tiêu dùng? Chọn tất cả các câu trả lời đúng.`,
          type: "multiple-choice",
          options: [
              `Sự phổ biến của thương hiệu`,
              `Sản phẩm có nguồn gốc tự nhiên`,
              `Sản phẩm nội địa`,
              `Giá cả phù hợp`
          ],
          userAnswer: null,
          correctAnswer: ["1", "3"]
      },
      {
          text: `Những lý do nào khiến bạn chuyển sang một nhãn hiệu tiêu dùng khác? Chọn tất cả các câu trả lời đúng.`,
          type: "multiple-choice",
          options: [
              `Giá tăng cao`,
              `Chất lượng giảm sút`,
              `Sản phẩm yêu thích bị ngừng sản xuất`,
              `Có sản phẩm thay thế tốt hơn`
          ],
          userAnswer: null,
          correctAnswer: ["0", "2"]
      },
      {
          text: `Bạn thích mua những sản phẩm tiêu dùng có đặc điểm nào? Chọn tất cả các câu trả lời đúng.`,
          type: "multiple-choice",
          options: [
              `Thân thiện với môi trường`,
              `Sản phẩm hữu cơ`,
              `Đóng gói tiện lợi`,
              `Có nhiều mùi hương lựa chọn`
          ],
          userAnswer: null,
          correctAnswer: ["0", "1"]
      },
      {
          text: `Bạn có thói quen mua sắm hàng tiêu dùng theo cách nào? Chọn tất cả các câu trả lời đúng.`,
          type: "multiple-choice",
          options: [
              `Lên danh sách trước`,
              `Mua theo cảm hứng`,
              `Chỉ mua khi có khuyến mãi`,
              `Mua tích trữ với số lượng lớn`
          ],
          userAnswer: null,
          correctAnswer: ["0", "3"]
      },
      {
          text: `Những sản phẩm nào bạn ưu tiên mua hàng nhập khẩu hơn hàng nội địa? Chọn tất cả các câu trả lời đúng.`,
          type: "multiple-choice",
          options: [
              `Mỹ phẩm`,
              `Thực phẩm chức năng`,
              `Hàng điện tử`,
              `Thực phẩm chế biến sẵn`
          ],
          userAnswer: null,
          correctAnswer: ["1", "2"]
      }
  );  

    // Group 4: Essay questions
    questions.push(
      {
          text: `Bạn có thể mô tả một trải nghiệm mua sắm hàng tiêu dùng gần đây mà bạn cảm thấy hài lòng? Điều gì làm bạn thích thú?`,
          type: "essay",
          userAnswer: null
      },
      {
          text: `Theo bạn, yếu tố nào quan trọng nhất khi lựa chọn một sản phẩm tiêu dùng? Giải thích lý do tại sao.`,
          type: "essay",
          userAnswer: null
      },
      {
          text: `Bạn có thói quen mua sắm hàng tiêu dùng như thế nào? Bạn thường mua theo kế hoạch hay ngẫu hứng?`,
          type: "essay",
          userAnswer: null
      },
      {
          text: `Bạn nghĩ thế nào về các sản phẩm tiêu dùng thân thiện với môi trường? Bạn có sẵn sàng trả giá cao hơn để sử dụng chúng không?`,
          type: "essay",
          userAnswer: null
      },
      {
          text: `Hãy kể về một lần bạn cảm thấy không hài lòng khi mua hàng tiêu dùng. Nguyên nhân do đâu?`,
          type: "essay",
          userAnswer: null
      },
      {
          text: `Bạn có thường xuyên mua hàng tiêu dùng trực tuyến không? Những lợi ích và hạn chế của hình thức này là gì theo bạn?`,
          type: "essay",
          userAnswer: null
      },
      {
          text: `Theo bạn, những chương trình khuyến mãi có ảnh hưởng lớn đến quyết định mua hàng tiêu dùng của bạn không? Tại sao?`,
          type: "essay",
          userAnswer: null
      },
      {
          text: `Bạn có ưu tiên sử dụng hàng nội địa hay hàng nhập khẩu không? Lý do của bạn là gì?`,
          type: "essay",
          userAnswer: null
      },
      {
          text: `Bạn có từng thay đổi thương hiệu một sản phẩm tiêu dùng mà bạn đã sử dụng lâu dài chưa? Nếu có, lý do là gì?`,
          type: "essay",
          userAnswer: null
      },
      {
          text: `Theo bạn, xu hướng tiêu dùng hiện nay có thay đổi so với 5 năm trước không? Những yếu tố nào tác động đến sự thay đổi đó?`,
          type: "essay",
          userAnswer: null
      }
  );  

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