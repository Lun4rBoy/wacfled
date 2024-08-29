﻿namespace WebAssistanConector.Clases
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
        public string IPAddress { get; set; }
        public string HostName { get; set; }
        public string MacAddress { get; set; }
    }

    public class NetworkScanner
    {
        public async Task<List<NetworkDevice>> ScanNetwork(string baseIP, int startRange, int endRange)
        {
            List<NetworkDevice> devices = new List<NetworkDevice>();

            for (int i = startRange; i <= endRange; i++)
            {
                string ipAddress = $"{baseIP}.{i}";

                if (await PingDevice(ipAddress))
                {
                    string hostName = GetHostName(ipAddress);
                    string macAddress = GetMacAddress(ipAddress);

                    devices.Add(new NetworkDevice
                    {
                        IPAddress = ipAddress,
                        HostName = hostName,
                        MacAddress = macAddress
                    });
                }
            }

            return devices;
        }

        private async Task<bool> PingDevice(string ipAddress)
        {
            using (Ping ping = new Ping())
            {
                try
                {
                    PingReply reply = await ping.SendPingAsync(ipAddress, 100);
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
