
using Microsoft.Identity;

namespace TheWheel.Models
{
    public class HttpClientWorksForGraph
    {

        public HttpClientWorksForGraph()
        {
            LogontoFpiSp();

        }

        private HttpClient _base = new HttpClient();
        private string _team = "8de454bb-026e-4698-8406-42df5c48995f";
        public async void LogontoFpiSp()
        {
            _base.BaseAddress = new Uri("https://login.microsoftonline.com/71c7c967-4bb2-4330-b416-5b7a2049761f/oauth2/V2.0/");
            var request = new HttpRequestMessage(HttpMethod.Post, "token");

            try
            {
                var keyValues = new List<KeyValuePair<string, string>>();
                keyValues.Add(new KeyValuePair<string, string>("scope", "https://graph.microsoft.com/.default"));
                keyValues.Add(new KeyValuePair<string, string>("client_id", "334c7412-f5ef-4f24-90d7-81f59194c147"));
                keyValues.Add(new KeyValuePair<string, string>("grant_type", "client_credentials"));
                keyValues.Add(new KeyValuePair<string, string>("client_secret", "0c.8Q~4rIUz1pL9pxA8ZZ9MeN4TvzHfD4LkeqbYU"));

                request.Content = new FormUrlEncodedContent(keyValues);
                var response = await _base.SendAsync(request);
                HttpContent content = response.Content;
                Task<FpiSpLoggedIn?> sysaidret = content.ReadFromJsonAsync<FpiSpLoggedIn>();

                string token = "";
                if (sysaidret.Result != null)
                {
                    token = sysaidret.Result.access_token;
                }

                _base.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                _base.DefaultRequestHeaders
                    .Accept
                    .Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

            }
            catch (Exception ex)
            {

                return;
            }
        }

        public class FpiSpLoggedIn
        {
            public string token_type { set; get; }
            public int expires_in { set; get; }
            public int ext_expires_in { set; get; }
            public string access_token { set; get; }
            
        }
        public async void AzIdLogin()
        {
            _base.BaseAddress = new Uri("https://login.microsoftonline.com/71c7c967-4bb2-4330-b416-5b7a2049761f/oauth2/V2.0/");
            var request = new HttpRequestMessage(HttpMethod.Post, "token");

            try
            {
                //var scopes = new[] { "User.Read" };
                var scopes = new[] { "https://graph.microsoft.com/.default" };

                // Multi-tenant apps can use "common",
                // single-tenant apps must use the tenant ID from the Azure portal
                var tenantId = "71c7c967-4bb2-4330-b416-5b7a2049761f";

                // Values from app registration
                var clientId = "334c7412-f5ef-4f24-90d7-81f59194c147";
                var clientSecret = "45b94c83-1d9e-4c56-aab8-5b5ee24b2a5a";

                // For authorization code flow, the user signs into the Microsoft
                // identity platform, and the browser is redirected back to your app
                // with an authorization code in the query parameters
                //var authorizationCode = "AUTH_CODE_FROM_REDIRECT";

                // using Azure.Identity;
                var options = new Azure.Identity.TokenCredentialOptions
                {
                    AuthorityHost = Azure.Identity.AzureAuthorityHosts.AzurePublicCloud
                };

                // https://docs.microsoft.com/dotnet/api/azure.identity.authorizationcodecredential
                //var authCodeCredential = new Azure.Identity.AuthorizationCodeCredential(
                //    tenantId, clientId, clientSecret, authorizationCode, options);

                var clientSecretCredential = new Azure.Identity.ClientSecretCredential(
                tenantId, clientId, clientSecret, options);

                //graphClient = new GraphServiceClient(clientSecretCredential, scopes);


                //var li2 = graphClient.Sites["umfpi.sharepoint.com,b1b8faec-ce8e-4293-b35c-7e8b225d5c21,c2235dbe-987d-45f5-824b-e3eb3c0e8753"].Lists["f0a498d4-3201-40cf-a36b-7c69f662e632"].Items;

            }
            catch (Exception ex)
            {
                return;
            }
        }


        //public GetUsers
    }
}
