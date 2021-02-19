import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.Twitch({
      clientId: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      scope: 'channel:manage:redemptions',
    }),
    // ...add more providers here
  ],
  callbacks: {
    /**
     * @param  {object}  token     Decrypted JSON Web Token
     * @param  {object}  user      User object      (only available on sign in)
     * @param  {object}  account   Provider account (only available on sign in)
     * @param  {object}  profile   Provider profile (only available on sign in)
     * @param  {boolean} isNewUser True if new user (only available on sign in)
     * @return {object}            JSON Web Token that will be saved
     */
    async jwt(token, user, account, profile, isNewUser) {
      console.log('jwt', token, user, account, profile, isNewUser)
      // Add access_token to the token right after signin
      if (account?.access_token) {
        token.access_token = account.access_token
      }
      if(user?.id){
        token.user_id = user.id
      }
      return token
    },
    /**
   * @param  {object} session      Session object
   * @param  {object} token        User object    (if using database sessions)
   *                               JSON Web Token (if not using database sessions)
   * @return {object}              Session that will be returned to the client 
   */
  async session(session, token) {
    console.log('session', session, token)
    if(token?.access_token) {
      // Add property to session, like an access_token from a provider
      session.access_token = token.access_token
    }
    if(token?.user_id) {
      // Add property to session, like an user_id from a provider
      session.user_id = token.user_id
    }
    
    
    return session
  }
  },
})
