import React from 'react';
import ReactPlayer from 'react-player';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

const VideoGallery = () => {
  const videos = [
    {
      id: 1,
      url: 'https://www.youtube.com/watch?v=videoID1',
      title: 'Thiago Salles - ICBC Lougheed - VanCastro',
      instructor: 'Thiago Salles',
      location: 'ICBC Lougheed',
      phone: '(604) 600-9173',
    },
    {
      id: 2,
      url: 'https://www.youtube.com/watch?v=videoID2',
      title: 'Gabriel - ICBC North Vancouver - VanCastro',
      instructor: 'Gabriel',
      location: 'ICBC North Vancouver',
      phone: '(604) 600-9173',
    },
    {
      id: 3,
      url: 'https://www.youtube.com/watch?v=videoID3',
      title: 'João Victor - ICBC North Vancouver - VanCastro',
      instructor: 'João Victor',
      location: 'ICBC North Vancouver',
      phone: '(604) 600-9173',
    },
  ];

  return (
    <div className="video-gallery">
      <Swiper
        navigation={true}
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {videos.map((video) => (
          <SwiperSlide key={video.id}>
            <div className="video-card">
              <ReactPlayer
                url={video.url}
                width="100%"
                height="200px"
                light={true}
                controls={true}
              />
              <div className="video-info">
                <div className="instructor-avatar">
                  {/* Avatar placeholder */}
                </div>
                <h3>VanCastro Driving School</h3>
                <p>@{video.instructor} - {video.location} • 1 year ago</p>
                <div className="video-footer">
                  <p>{video.instructor} - {video.location} - VanCastro {video.phone}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default VideoGallery;