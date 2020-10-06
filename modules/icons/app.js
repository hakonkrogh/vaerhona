import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Icon extends Component {
  static defaultProps = {
    width: '30px',
    height: '30px',
    fill: null,
    className: '',
  };

  static propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
    fill: PropTypes.string,
    className: PropTypes.string,
  };

  render() {
    const { width, height, fill, className } = this.props;

    const style = {
      width,
      height,
    };

    const fillUmbrella = fill || '#81a594';
    const fillBar = fill || '#c5c5bd';
    const fillHen = fill || '#00628b';

    return (
      <svg
        version="1.1"
        viewBox="0,0,1000,1000"
        style={style}
        className={className}
      >
        <title id="title">App icon</title>
        <path
          d="M483.332+267.028L507.07+267.028L507.07+691.676L483.332+691.676L483.332+267.028Z"
          fill={fillBar}
        />
        <path
          d="M504.812+70.1562C383.086+70.1562+285.321+175.736+244.16+292.084C252.666+280.01+286.003+256.484+312.732+262.295C336.966+267.563+356.396+308.135+356.634+308.655C361.467+302.156+391.754+264.051+438.772+272.046C469.501+277.271+492.461+331.34+493.151+332.665C493.75+332.224+531.984+272.896+559.612+272.606C589.408+272.294+636.209+308.543+636.457+308.995C639.838+299.956+644.975+275.35+681.559+265.899C716.716+256.817+761.671+284.048+763.781+285.719C713.697+157.288+616.521+70.1562+504.812+70.1562Z"
          opacity="1"
          fill={fillUmbrella}
        />
        <path
          d="M720.812+335.156C641.07+332.374+630.97+377.055+631.625+404.375C632.172+427.196+630.836+604.12+630.656+604.125C630.505+604.129+351.857+607.914+350.406+605.594C348.517+602.57+348.119+441.409+347.406+406.625C346.69+371.672+107.436+321.897+129.625+531.75C129.73+532.744+210.834+531.986+210.844+532.156C221.994+725.13+299.537+897.886+504.812+897.938C709.296+897.989+784.232+739.563+798.031+546.75C798.134+545.317+881.542+511.064+881.75+498.812C881.85+492.909+800.227+463.336+800.188+462.875C795.466+408.271+805.234+338.102+720.812+335.156ZM732.625+415.906C747.462+415.364+747.111+439.122+733.438+439.312C718.468+439.544+718.889+415.961+732.625+415.906Z"
          opacity="1"
          fill={fillHen}
        />
      </svg>
    );
  }
}
