// controladorLed.js
// Copyright (C) 2024 Lun4rBoy
//
// Licenciado bajo la Licencia Apache, Versión 2.0 (la "Licencia");
// no puedes usar este archivo excepto en cumplimiento con la Licencia.
// Puedes obtener una copia de la Licencia en
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// A menos que lo requiera la ley aplicable o se acuerde por escrito,
// el software distribuido bajo la Licencia se distribuye "TAL CUAL",
// SIN GARANTÍAS O CONDICIONES DE NINGÚN TIPO, ni explícitas ni implícitas.
// Consulta la Licencia para conocer el lenguaje específico que rige
// los permisos y limitaciones bajo la Licencia.

document.addEventListener("DOMContentLoaded", function () {
    const colorInput = document.getElementById("colorInput");
    const speedInput = document.getElementById("speedInput");
    const brightnessInput = document.getElementById("brightnessInput");
    const animationSelect = document.getElementById("animationSelect");
    const colorForm = document.getElementById("colorForm");
    const speedForm = document.getElementById("speedForm");
    const brightnessForm = document.getElementById("brightnessForm");
    const animationForm = document.getElementById("animationForm");
    const toggleForm = document.getElementById("toggleForm");
    const eventViewer = document.getElementById("eventViewer");
    const infoForm = document.getElementById("infoForm");
    const footer = document.getElementById("animatedFooter");
    const ipDevice = document.getElementById("ipDevice");

    const gifUrl = "https://i.gifer.com/Y3il.gif";

    const gifImage = document.createElement("img");

    footer.style.position = "relative";

    function createImage() {
        gifImage.src = gifUrl;
        gifImage.alt = "Loading Animation";
        gifImage.style.position = "absolute";
        gifImage.style.bottom = "10px";
        gifImage.style.left = "0px"; // Inicialmente en 0px
        gifImage.style.width = "60px";
        gifImage.style.height = "60px";
        gifImage.style.zIndex = "10";
    }

    createImage();

    let pos = 0;
    let footerWidth, gifWidth;
    const speed = 0.8;
    let direction = 1;
    let animationFrameId;

    function startAnimation() {
        if (footer && gifImage) {
            footer.appendChild(gifImage);
            footerWidth = footer.offsetWidth;
            gifWidth = gifImage.offsetWidth;
            pos = 0;
            animate();
        }
    }

    function stopAnimation() {
        cancelAnimationFrame(animationFrameId);
    }

    function adjustAnimation() {
        footerWidth = footer.offsetWidth;
        gifWidth = gifImage.offsetWidth;
        pos = Math.min(pos, footerWidth - gifWidth); // Ajustar la posición para que no se desborde
    }

    function animate() {
        if (pos + gifWidth > footerWidth || pos < 0) {
            direction *= -1; // Cambiar la dirección
            gifImage.style.transform = `scaleX(${direction})`;
        }

        pos += speed * direction;
        gifImage.style.left = `${pos}px`;

        animationFrameId = requestAnimationFrame(animate); // Llama a la función en el siguiente ciclo de animación
    }

    window.addEventListener("resize", () => {
        stopAnimation();
        adjustAnimation();
        startAnimation();
    });

    // Iniciar la animación
    gifImage.onload = startAnimation;


    function appendMessage(message) {
        eventViewer.innerHTML = "";
        const p = document.createElement("p");
        // Reemplaza los saltos de línea con <br>
        p.innerHTML = message.replace(/\n/g, '<br>');
        p.style.color = "white"
        eventViewer.appendChild(p);
        eventViewer.scrollTop = eventViewer.scrollHeight;
    }

    async function sendRequest(endpoint, value) {
        try {
            const data = {
                Values: value,
                Ip: ipDevice.value
            };
            if (ipDevice.value == '') {
                appendMessage("Error: No se ingreso una ip!");
                return;
            }
            const response = await fetch(`/api/led/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            appendMessage(result.message);
        } catch (error) {
            appendMessage(`Error: ${error.message}`);
        }
    }

    colorForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const color = colorInput.value.slice(1); // Remove the '#' from the color value
        sendRequest("change-color", `${color}`);
    });

    speedForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const speed = parseInt(speedInput.value, 10);
        sendRequest("change-speed", `${speed}`);
    });

    brightnessForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const brightness = parseInt(brightnessInput.value, 10);
        sendRequest("change-brightness", `${brightness}`);
    });

    toggleForm.addEventListener("submit", function (event) {
        event.preventDefault();
        sendRequest("toggle", "0");
    });

    animationForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const animation = parseInt(animationSelect.value)
        sendRequest("change-animation", `${animation}`);
    });

    infoForm.addEventListener("submit", function (event) {
        event.preventDefault();
        sendRequest("info", "0");
    });


});