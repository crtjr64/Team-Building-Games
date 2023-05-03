using Microsoft.AspNetCore.SignalR;


namespace TheWheel.Models.Hubs
{
    public class WofChatHub: Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
        public async Task SendAction(string action)
        {
            await Clients.All.SendAsync("ReceiveAction", action);
        }
    }
}
