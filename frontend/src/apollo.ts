import {ApolloClient, ApolloLink, concat, createHttpLink, InMemoryCache} from '@apollo/client/core'

const httpLink = createHttpLink({
    uri: import.meta.env.VITE_BACKEND_API_URL + 'graphql',
})

// Cache implementation
//TODO: IS REALLY NEEDED?
const cache = new InMemoryCache()

const authMiddleware = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    const token = localStorage.getItem('token');
    operation.setContext({
        headers: {
            authorization: token ? `Bearer ${token}` : "",
        },
    });
    return forward(operation);
});

// Create the apollo client
export const apolloClient = new ApolloClient({
    link: concat(authMiddleware, httpLink),
    cache,
})
