// controladorLed.js
// Copyright (C) 2024 Lun4rBoy
//
// Licenciado bajo la Licencia Apache, Versi�n 2.0 (la "Licencia");
// no puedes usar este archivo excepto en cumplimiento con la Licencia.
// Puedes obtener una copia de la Licencia en
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// A menos que lo requiera la ley aplicable o se acuerde por escrito,
// el software distribuido bajo la Licencia se distribuye "TAL CUAL",
// SIN GARANT�AS O CONDICIONES DE NING�N TIPO, ni expl�citas ni impl�citas.
// Consulta la Licencia para conocer el lenguaje espec�fico que rige
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
    const ipSelect = document.getElementById('ipDevice');
    const manualIpInput = document.getElementById('manualIp');
    const refreshButton = document.getElementById('refreshIps');

    //const botonTest = document.getElementById("botonTest");

    


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
        pos = Math.min(pos, footerWidth - gifWidth); // Ajustar la posici�n para que no se desborde
    }

    function animate() {
        if (pos + gifWidth > footerWidth || pos < 0) {
            direction *= -1; // Cambiar la direcci�n
            gifImage.style.transform = `scaleX(${direction})`;
        }

        pos += speed * direction;
        gifImage.style.left = `${pos}px`;

        animationFrameId = requestAnimationFrame(animate); // Llama a la funci�n en el siguiente ciclo de animaci�n
    }

    window.addEventListener("resize", () => {
        stopAnimation();
        adjustAnimation();
        startAnimation();
    });

    // Iniciar la animaci�n
    gifImage.onload = startAnimation;


    function appendMessage(message) {
        eventViewer.innerHTML = "";
        const p = document.createElement("p");
        // Reemplaza los saltos de l�nea con <br>
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
            if (ipDevice.value == '' && endpoint != "devices") {
                appendMessage("Error: No se ingreso una ip!");
                return;
            }
            const response = await fetch(`/api/led/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (endpoint === "devices") {
                return await result;
            }
            appendToEventViewer(result.message);
        } catch (error) {
            appendToEventViewer(`Error: ${error.message}`);
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

    infoForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        try {
            const response = await sendRequest("info", getSelectedIp());
        } catch (error) {
        }
    });

    /*botonTest.addEventListener("submit", function () {
        event.preventDefault();
        sendRequest("devices", "0");
    });*/

    async function getIps() {
        try { 
            var response = await sendRequest("devices", "0");
            var ips = JSON.parse(response.message);

            // Mantener la opción manual y limpiar el resto del select
            ipDevice.innerHTML = '<option value="manual">Ingreso manual</option>';

            if (ips.length > 0) {
                ips.forEach((ip, index) => {
                    const op = document.createElement("option");
                    op.value = ip.IPAddress;
                    op.text = ip.IPAddress;
                    // Seleccionar automáticamente la primera IP encontrada
                    if (index === 0) {
                        op.selected = true;
                    }
                    ipDevice.appendChild(op);
                });
            } else {
                const op = document.createElement("option");
                op.text = "Devices not found";
                op.selected = true;
                ipDevice.appendChild(op);
            }
        } catch (error) {
            console.error("Error obteniendo las IPs:", error);
            ipDevice.innerHTML = '<option value="manual">Ingreso manual</option><option selected>Devices not found</option>';
        }
    }

    getIps();

    // Asegurarnos de que los elementos existen antes de agregar los listeners
    if (ipSelect && manualIpInput && refreshButton) {
        // Manejar cambio en el select
        ipSelect.addEventListener('change', function() {
            if (this.value === 'manual') {
                manualIpInput.classList.remove('d-none');
                ipSelect.classList.add('d-none');
            }
        });

        // Agregar botón para volver al select
        manualIpInput.addEventListener('keydown', function(e) {
            // Si presiona Escape, vuelve al select
            if (e.key === 'Escape') {
                manualIpInput.classList.add('d-none');
                ipSelect.classList.remove('d-none');
                ipSelect.value = ipSelect.options[1].value;
            }
        });

        // Manejar el botón de refresh
        refreshButton.addEventListener('click', function() {
            // Asegurarse de mostrar el select y ocultar el input manual
            manualIpInput.classList.add('d-none');
            ipSelect.classList.remove('d-none');
            
            ipSelect.innerHTML = '<option value="manual">Ingreso manual</option><option selected>Searching...</option>';
            getIps(); // Usar la función getIps que ya existe en tu código
        });
    }

    // Función para obtener la IP seleccionada
    window.getSelectedIp = function() {
        if (!manualIpInput.classList.contains('d-none')) {
            return manualIpInput.value;
        }
        return ipSelect.value;
    }

    function appendToEventViewer(message) {
        // Asegurarse de que el mensaje termine con un salto de línea
        if (!message.endsWith('\n')) {
            message += '\n';
        }
        
        // Si existe la función typeWriter, mostrar en el monitor 3D
        if (typeof typeWriter === 'function') {
            typeWriter(message);
        }
    }
});