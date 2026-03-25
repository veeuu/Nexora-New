import { useRef, useState } from 'react';
import '../styles/clientLogosCarousel.css';

// Import all client logos
import logo1 from '../client logos/5.png';
import logo2 from '../client logos/8x8.png';
import logo3 from '../client logos/Adobe.png';
import logo4 from '../client logos/AWS.png';
import logo5 from '../client logos/cisco.png';
import logo6 from '../client logos/Crestron.png';
import logo7 from '../client logos/Equinix.png';
import logo8 from '../client logos/Kyndryl.png';
import logo9 from '../client logos/Nice.png';
import logo10 from '../client logos/Sentinel One.png';
import logo11 from '../client logos/Siemens.png';
import logo12 from '../client logos/Singtel.png';
import logo13 from '../client logos/Twilio.png';

const ClientLogosCarousel = () => {
  const logos = [
    { id: 1, src: logo1, alt: '5' },
    { id: 2, src: logo2, alt: '8x8' },
    { id: 3, src: logo3, alt: 'Adobe' },
    { id: 4, src: logo4, alt: 'AWS' },
    { id: 5, src: logo5, alt: 'Cisco' },
    { id: 6, src: logo6, alt: 'Crestron', small: true },
    { id: 7, src: logo7, alt: 'Equinix', small: true },
    { id: 8, src: logo8, alt: 'Kyndryl' },
    { id: 9, src: logo9, alt: 'Nice' },
    { id: 10, src: logo10, alt: 'Sentinel One', small: true },
    { id: 11, src: logo11, alt: 'Siemens' },
    { id: 12, src: logo12, alt: 'Singtel' },
    { id: 13, src: logo13, alt: 'Twilio' },
  ];

  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  return (
    <section className="client-logos-section">
      <div
        className={`logos-container ${isHovered ? 'paused' : ''}`}
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {[...logos, ...logos].map((logo, idx) => (
          <img
            key={`${logo.id}-${idx}`}
            src={logo.src}
            alt={logo.alt}
            className={`logo-image ${logo.small ? 'logo-small' : ''}`}
          />
        ))}
      </div>
    </section>
  );
};

export default ClientLogosCarousel;
