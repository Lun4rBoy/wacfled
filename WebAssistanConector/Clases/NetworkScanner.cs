// NetworkScanner.cs
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

namespace WebAssistanConector.Clases
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Net;
    using System.Net.NetworkInformation;
    using System.Text.RegularExpressions;
    using System.Threading.Tasks;

    public class NetworkDevice
    {
        public string? IPAddress { get; set; }

    }

    public class NetworkScanner
    {
        private readonly Led _led;

        public NetworkScanner()
        {
            _led = new Led();
        }

        public async Task<List<NetworkDevice>> ScanNetwork(string baseIP, int startRange, int endRange)
        {
            
            List<Task<NetworkDevice?>> tasks = new List<Task<NetworkDevice?>>();

            for (int i = startRange; i <= endRange; i++)
            {
                string ipAddress = $"{baseIP}.{i}";
                tasks.Add(PingAndGetDevice(ipAddress));
            }

            // Ejecutar todas las tareas de ping en paralelo y esperar su finalización
            NetworkDevice?[] devicesArray = await Task.WhenAll(tasks);

            List<NetworkDevice?> ipList = new List<NetworkDevice?>();
            foreach (var device in devicesArray)
            {
                if (device?.IPAddress == null) continue;
                var test = _led.GetInfoDevice(device.IPAddress);
                if ( test == "" || test == null || test == string.Empty) continue;
                ipList.Add(device);
            }
            // Filtrar los resultados nulos (direcciones que no respondieron al ping)
            return ipList.ToList();
        }

        public async Task<List<NetworkDevice>> ScanNetworkParallelAsync(string baseIP, int startRange, int endRange)
        {
            List<Task<NetworkDevice?>> tasks = new List<Task<NetworkDevice?>>();

            // Definir la cantidad máxima de tareas que puedes ejecutar en paralelo
            int maxDegreeOfParallelism = 10;
            using (SemaphoreSlim concurrencySemaphore = new SemaphoreSlim(maxDegreeOfParallelism))
            {
                for (int i = startRange; i <= endRange; i++)
                {
                    string ipAddress = $"{baseIP}.{i}";

                    // Agregar una tarea para ejecutar el ping de manera asíncrona y controlada
                    tasks.Add(Task.Run(async () =>
                    {
                        await concurrencySemaphore.WaitAsync(); // Controlar el número de tareas concurrentes
                        try
                        {
                            if (await PingDevice(ipAddress))
                            {
                                var test = _led.GetInfoDevice(ipAddress);
                                if (!string.IsNullOrEmpty(test))
                                {
                                    return new NetworkDevice { IPAddress = ipAddress };
                                }
                            }
                            return null;
                        }
                        finally
                        {
                            concurrencySemaphore.Release();
                        }
                    }));
                }

                // Ejecutar todas las tareas y esperar a que finalicen
                NetworkDevice?[] devicesArray = await Task.WhenAll(tasks);
                return devicesArray.Where(d => d != null).ToList();
            }
        }


        private async Task<NetworkDevice?> PingAndGetDevice(string ipAddress)
        {
            try
            {
                if (await PingDevice(ipAddress))
                {
                    // Devuelve el dispositivo si responde al ping
                    return new NetworkDevice
                    {
                        IPAddress = ipAddress,
                    };
                }
            }
            catch{ }
            
            // Devuelve null si no responde
            return null;
        }

        private async Task<bool> PingDevice(string ipAddress)
        {
            using (Ping ping = new Ping())
            {
                try
                {
                    PingReply reply = await ping.SendPingAsync(ipAddress, 100); // Timeout de 100ms
                    return reply.Status == IPStatus.Success;
                }
                catch
                {
                    return false;
                }
            }
        }


        private string GetHostName(string ipAddress)
        {
            try
            {
                IPHostEntry hostEntry = Dns.GetHostEntry(ipAddress);
                return hostEntry.HostName;
            }
            catch
            {
                return "Unknown";
            }
        }

        private string GetMacAddress(string ipAddress)
        {
            string macAddress = "Unknown";
            try
            {
                Process process = new Process();
                process.StartInfo.FileName = "arp";
                process.StartInfo.Arguments = $"-a {ipAddress}";
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.CreateNoWindow = true;
                process.Start();

                string output = process.StandardOutput.ReadToEnd();
                process.Close();

                string pattern = @"([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})";
                Match match = Regex.Match(output, pattern, RegexOptions.IgnoreCase);

                if (match.Success)
                {
                    macAddress = match.Value;
                }
            }
            catch
            {
                // Ignorar excepciones para evitar que el programa se detenga.
            }

            return macAddress;
        }
    }

}
