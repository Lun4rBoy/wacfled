using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Sockets;
using System.Text;

namespace WebAssistanConector.Clases
{
    public class Led
    {

        public Dictionary<string,string>? SendCommand(string hexCommand, string ControllerIp)
        {
            try
            {
                string response = string.Empty;

                using (TcpClient client = new TcpClient(ControllerIp, 8189))
                using (NetworkStream stream = client.GetStream())
                {
                    byte[] data = StringToByteArray(hexCommand);
                    stream.Write(data, 0, data.Length);

                    // Leer la respuesta
                    byte[] responseBuffer = new byte[256]; // Ajusta el tamaño del buffer si es necesario
                    int bytesRead = stream.Read(responseBuffer, 0, responseBuffer.Length);

                    if (bytesRead > 0)
                    {
                        response = BitConverter.ToString(responseBuffer, 0, bytesRead).Replace("-", string.Empty);

                    }

                    return ParseResponse(response);
                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        private byte[] StringToByteArray(string hex)
        {
            int numberChars = hex.Length;
            byte[] bytes = new byte[numberChars / 2];
            for (int i = 0; i < numberChars; i += 2)
                bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
            return bytes;
        }

        public void ChangeColor(string colorHex, string ip)
        {
            // El color debe estar en formato "RRGGBB"
            string command = "38" + colorHex + "2283";
            SendCommand(command, ip);
        }

        public void ChangeSpeed(int speed, string ip)
        {
            string speedHex = speed.ToString("X2");
            string command = "38" + speedHex + "00000383";
            SendCommand(command, ip);
        }

        public void ChangeAnimation(int op, string ip)
        {
            string command = string.Empty;

            switch (op)
            {
                case 0: command = "380300002c83"; //mix
                    break;
                case 1: command = "38cd00002c83"; //meteor
                    break;
                case 2: command = "38ce00002c83"; //breathing
                    break;
                case 3: command = "38d100002c83"; //wave
                    break;
                case 4:
                    command = "38d400002c83"; //catchup
                    break;
                case 5:
                    command = "38d300002c83"; //static
                    break;
                case 6:
                    command = "38cf00002c83"; //stack
                    break;
                case 7:
                    command = "38d200002c83"; //flash
                    break;
                case 8:
                    command = "38d000002c83"; //flow
                    break;
            }

            SendCommand(command, ip);
        }

        public void ChangeBrightness(int brightness, string ip)
        {
            string brightnessHex = brightness.ToString("X2").PadLeft(2, '0');
            string command = $"38{brightnessHex}00002A83"; // Comando para cambiar el brillo
            SendCommand(command,ip);
        }

        public bool? ToggleDevice(string ip)
        {
            var test = SendCommand("38000000AA83",ip);

            if (test == null) return false;
            foreach (var item in test) { 
                if(item.Key!= "Device on/off") continue;
                if (item.Value == "01") return true;
                return false;
            }

            return null;
        }

        public string GetInfoDevice(string ip)
        {
            var test = SendCommand("380000001083", ip);
            string message = string.Empty;
            if (test == null) return message;
            foreach (var item in test)
            {
                message += item.Key.ToString() + ": " + item.Value.ToString() + "\n";
            }
            return message;
        }

        public Dictionary<string, string> ParseResponse(string response)
        {
            // Asegúrate de que la respuesta tenga la longitud esperada (34 caracteres para 17 bytes)
            if (response.Length != 34)
            {
                throw new ArgumentException("La longitud de la respuesta no es la esperada.");
            }

            // Diccionario para almacenar los valores separados
            var parsedData = new Dictionary<string, string>
    {
        { "Start byte", response.Substring(0, 2) },
        { "Device on/off", response.Substring(2, 2) },
        { "Current animation", response.Substring(4, 2) },
        { "Animation speed", response.Substring(6, 2) },
        { "LEDs brightness", response.Substring(8, 2) },
        { "Color order", response.Substring(10, 2) },
        { "LEDs per segment", response.Substring(12, 4) }, // 2 pares de bytes
        { "Number of segments", response.Substring(16, 4) }, // 2 pares de bytes
        { "Current mono animation color", response.Substring(20, 6) }, // 3 pares de bytes
        { "IC type", response.Substring(26, 2) },
        { "Number of recorded patterns", response.Substring(28, 2) },
        { "White LED brightness", response.Substring(30, 2) },
        { "End byte", response.Substring(32, 2) }
    };

            return parsedData;
        }
    }
}
