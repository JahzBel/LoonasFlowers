        if (sessionStorage.getItem("accessGranted") === "true") {
            window.location.href = "flower.html"; 
        }
      const correctPassword = "2106"; // Cambia esto a la contraseña correcta
      const display = document.getElementById("inputDisplay");
      let input = "";
      function enterDigit(digit) {
        if (input.length < 4) {
          input += digit;
        }
        display.textContent = input.padEnd(4, "*");
        if (input.length === 4) {
          if (input === correctPassword) {
            sessionStorage.setItem("accessGranted", "true");
            window.location.href = "flower.html"; 
          } else {
            alert("Contraseña incorecta, intenta de nuevo");
            clearInput();
          }
        }
      }
      function clearInput() {
        input = "";
        display.textContent = "****";
      }
      
