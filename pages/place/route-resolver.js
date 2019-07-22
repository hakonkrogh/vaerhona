const RouteResolver = () => 'Hello from route resolver';

RouteResolver.getInitialProps = ({ req }) => {
  console.log(req.headers.referer);
  debugger;
  return {};
};

export default RouteResolver;
