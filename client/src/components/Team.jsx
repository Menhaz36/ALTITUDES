import React from 'react'
import About from './About.jsx'
import assets from '../assets/assets.js'
const Team = () => {

  const people=[
    {
        pname: 'Menhazul Abdin',
        role: 'Student, 3rd Year, BTech',
        description: 'Explorative at heart, I find joy in designing web solutions that fuse imagination, structure, and technology.',
        image: assets.menhaz,
    },
    {
        pname: 'Ruchika Sharma',
        role: 'Student, 3rd Year, Btech',
        description: 'Inspired by how the web connects ideas and tells stories, I love building projects that merge creativity with purpose.',
        image: assets.ruchika,
    },
    {
        pname: 'Zara Fatma',
        role: 'Student, 3rd Year, Btech',
        description: 'Fueled by curiosity for the web and data, I enjoy building things that blend creativity, logic, and innovation.',
        image: assets.zara,
    }
    

  ]  

  return (
    <div className="bg-black py-20 flex flex-wrap justify-center gap-15">
            {people.map((person, idx) => (
                <About key={idx} {...person} />
            ))}
        </div>
  )
}

export default Team