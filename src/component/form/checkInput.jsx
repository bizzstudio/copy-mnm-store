// src/component/form/checkInput.jsx
import React, { forwardRef } from 'react';
import styled from 'styled-components';

const checkInput = forwardRef(({ id, type = "checkbox", ...props }, ref) => {
    const uniqueId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
        <StyledWrapper>
            <div className="container">
                <input 
                    ref={ref}
                    id={uniqueId} 
                    style={{ display: 'none' }} 
                    type={type}
                    {...props} 
                />
                <label htmlFor={uniqueId} className="check">
                    <svg width="18px" height="18px" viewBox="0 0 18 18">
                        <path d="M 1 9 L 1 9 c 0 -5 3 -8 8 -8 L 9 1 C 14 1 17 5 17 9 L 17 9 c 0 4 -4 8 -8 8 L 9 17 C 5 17 1 14 1 9 L 1 9 Z" />
                        <polyline points="1 9 7 14 15 4" />
                    </svg>
                </label>
            </div>
        </StyledWrapper>
    );
});

checkInput.displayName = 'CheckInput';

const StyledWrapper = styled.div`
  .check {
    cursor: pointer;
    position: relative;
    margin: auto;
    width: 18px;
    height: 18px;
    -webkit-tap-highlight-color: transparent;
    transform: translate3d(0, 0, 0);
  }

  .check:before {
    content: "";
    position: absolute;
    top: -15px;
    left: -15px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(34, 50, 84, 0.03);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .check svg {
    position: relative;
    z-index: 1;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke: #1f3573;
    stroke-width: 1.5;
    transform: translate3d(0, 0, 0);
    transition: all 0.2s ease;
  }

  .check svg path {
    stroke-dasharray: 60;
    stroke-dashoffset: 0;
  }

  .check svg polyline {
    stroke-dasharray: 22;
    stroke-dashoffset: 66;
  }

  .check:hover:before {
    opacity: 1;
  }

  .check:hover svg {
    stroke: var(--accent-color, #3961ce);
  }

  input:checked + .check svg {
    stroke: var(--accent-color, #1f3573);
  }

  input:checked + .check svg path {
    stroke-dashoffset: 60;
    transition: all 0.3s linear;
  }

  input:checked + .check svg polyline {
    stroke-dashoffset: 42;
    transition: all 0.2s linear;
    transition-delay: 0.15s;
  }

  input:disabled + .check {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export default checkInput;
