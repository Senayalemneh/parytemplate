import CarouselPage from "../../../components/Home/carouselPage";

import Partners from "../../../components/Home/ourpartners";
import GovLeaders from "../../../components/Home/governmentLeaders";
import Location from "../../../components/Home/LocationPage";
import BoleOffcials from "../../../components/Home/BoleSubcityOfficials";
import VisitorCounter from "../../../components/Home/visitorCounter";
import News from "../../../components/News/news"

const LandingPage = () => {
  return (
    <div>
      <CarouselPage />
      <News/>
      {/* <GovLeaders />
       <BoleOffcials /> */}
      <Location />
      <Partners />
      <VisitorCounter />
    </div>
  );
};

export default LandingPage;
