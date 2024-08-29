using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

//using Newtonsoft.Json;
using System.Text.Json.Nodes;
using WebAssistanConector.Clases;

namespace WebAssistanConector.Pages
{
    [ApiController]
    [Route("api/[controller]")]
    public class LedController : ControllerBase
    {
        private readonly Led _led;
        private readonly NetworkScanner _networkScanner;

        public LedController()
        {
            _led = new Led(); // IP ya está configurada en la clase Led
        }

        public class DeviceValues
        {
            public string? Values { get; set; }
            public string? Ip { get; set; }
        }

        [HttpPost("change-color")]
        public IActionResult ChangeColor([FromBody] DeviceValues d)
        {
            if (string.IsNullOrEmpty(d.Values) || d.Values.Length != 6)
            {
                return BadRequest(new { message = "Invalid color format. Must be 6 hex characters." });
            }

            _led.ChangeColor(d.Values, d.Ip);
            return Ok(new {message = "Color changed successfully." });
        }

        [HttpPost("change-speed")]
        public IActionResult ChangeSpeed([FromBody] DeviceValues d)
        {
            var speed = Int32.Parse(d.Values);
            if (speed< 0 || speed > 255)
            {
                return BadRequest(new { message = "Speed must be between 0 and 255." });
            }

            _led.ChangeSpeed(speed, d.Ip);
            return Ok(new { message = "Speed changed successfully." });
        }

        [HttpPost("change-animation")]
        public IActionResult ChangeAnimation([FromBody] DeviceValues d)
        {
            var animation = Int32.Parse(d.Values);
            _led.ChangeAnimation(animation, d.Ip);
            return Ok(new { message = "Animation changed successfully." });
        }

        [HttpPost("change-brightness")]
        public IActionResult ChangeBrightness([FromBody] DeviceValues d)
        {
            var brightness = Int32.Parse(d.Values);
            if (brightness < 0 || brightness > 255)
            {
                return BadRequest(new { message = "Brightness must be between 0 and 255." });
            }

            _led.ChangeBrightness(brightness, d.Ip);
            return Ok(new { message = "Brightness changed successfully." });
        }

        [HttpPost("toggle")]
        public IActionResult ToggleDevice([FromBody] DeviceValues d)
        {
            var info = _led.ToggleDevice(d.Ip);
            if (info==null) return BadRequest(new { message = "Dispositivo no responde." });
            string response = string.Empty;

            if (info == true) response = "Dispositivo encendido";
            if (info == false) response = "Dispositivo apagado";

            return Ok(new { message = response});
        }

        [HttpPost("info")]
        public IActionResult InfoDevice([FromBody] DeviceValues d)
        {
            var info = _led.GetInfoDevice(d.Ip);
            if (info == null || info == "") return BadRequest( new {message="Dispositivo no responde."});
            return Ok(new { message = info });
        }

        public async Task<IActionResult> GetIps()
        {
           var devices = await _networkScanner.ScanNetwork("192.168.1",1,254);
            string json = JsonSerializer.Serialize(devices, new JsonSerializerOptions { WriteIndented = true });
            return Ok(json);
        }
    }

}

