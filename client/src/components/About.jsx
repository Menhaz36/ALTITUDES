import React from 'react'

const About = ({ pname, role, description, image}) => {
    const [visible, setVisible] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const divRef = React.useRef(null);

    const handleMouseMove = (e) => {
        const bounds = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    };

    return (
        <div ref={divRef} onMouseMove={handleMouseMove} onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}
            className="relative w-80 h-96 rounded-xl p-px bg-gray-900 backdrop-blur-md text-gray-800 overflow-hidden shadow-lg cursor-pointer"
        >
                <div className={`pointer-events-none blur-3xl rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-300 size-60 absolute z-0 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
                    style={{ top: position.y - 120, left: position.x - 120, }}
                />

            <div className="relative z-10 bg-gray-900/75 p-6 h-full w-full rounded-[11px] flex flex-col items-center justify-center text-center">
                <img src={image} alt={pname} className="w-24 h-24 rounded-full shadow-md my-4" />
                <h2 className="text-2xl font-bold text-white mb-1">{pname}</h2>
                <p className="text-sm text-cyan-500 font-medium mb-4">{role}</p>
                <p className="text-sm text-slate-400 mb-4 px-4">
                    {description}
                </p>
                
            </div>
        </div>
    );
}

export default About