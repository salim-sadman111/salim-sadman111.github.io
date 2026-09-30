/* =====================================================================
   SITE CONTENT: photos, videos, build logs, certificates and crests
   ---------------------------------------------------------------------
   This is the only file you need to edit to add media. Every page reads
   it and builds the rest by itself.

   WHERE FILES GO (inside the repository)
     images/quadruped.jpg, images/rover.jpg, images/glider.jpg,
     images/iot-node.jpg
         Cover photo of each project: shown on its home-page card and at
         the top of its build-log page. Until a file exists, the animated
         drawing stays in its place.
     images/projects/<project>/<name>.jpg
         Photos for a build log, e.g. images/projects/rover/arm-test.jpg
         (<project> is quadruped, rover, glider or agrosense)
     images/certificates/<name>.jpg
         Certificate scans and crest photos, e.g.
         images/certificates/arc-2026.jpg

   SIZES (keeps every page fast)
     Photos:        JPG, about 1600 px on the long side, under ~400 KB.
     Certificates:  JPG (or PNG), about 1600 px on the long side.
     Videos:        upload to YouTube (Unlisted is fine), paste the link.
     There is no limit on how many you add: build-log photos load only
     when a visitor scrolls to them, and none of them slow the home page.

   THREE RULES THAT KEEP THIS FILE WORKING
     1. Text goes inside "double quotes". Apostrophes are fine: "robot's".
     2. Every item ends with a comma, like the examples below.
     3. Anything left empty ("") is ignored, so unused slots are safe.
   If the build logs or certificates ever vanish after an edit, a comma
   or a quote is missing. Undo the last change and look again.
   ===================================================================== */

window.SITE = {

  /* ------------------------------ PROJECTS ------------------------------
     cover.image  Photo on the home-page card and at the top of the page.
     cover.video  YouTube link. With a cover photo, a "Watch video" button
                  appears on the photo. Without one, the video's thumbnail
                  becomes the cover and plays when clicked.
     log          The build log: one entry per step, oldest first.

     One build-log entry looks like this:
       {
         date:  "Mar 2025",                  any text: a month, "Stage 2", "Next"
         title: "What happened",
         text:  "One or two sentences.",     or several: ["First paragraph.", "Second."]
         media: [                            optional; add as many as you like
           { image: "images/projects/rover/arm.jpg", caption: "The arm on the bench" },
           { video: "https://youtu.be/XXXXXXXXXXX", caption: "First drive test", length: "1:45" },
           { certificate: "arc-2026" },      reuses a certificate from the list below
         ],
       },
     Stage labels stand in for dates you haven't given yet; change them to
     real months ("Mar 2025") whenever you like.
  ------------------------------------------------------------------------ */
  projects: {

    quadruped: {
      title:  "Quadruped Robot with Custom Cycloidal QDD Actuators",
      short:  "Quadruped",
      kicker: "B.Sc. thesis · RUET",
      tone:   "teal",
      icon:   "i-legs",
      page:   "projects/quadruped.html",
      cover: {
        image:   "images/quadruped.jpg",
        video:   "",
        alt:     "The assembled 12-DoF quadruped robot",
        caption: "The assembled 12-DoF quadruped; its structure and all twelve actuators were fabricated in-house.",
      },
      log: [
        {
          date:  "Stage 1",
          title: "Actuator design",
          text:  "Designed a compact quasi-direct-drive joint actuator: a BLDC motor driving a cycloidal reducer, with encoder feedback and field-oriented control. The design targets the torque density and backdrivability that legged locomotion needs; the reducer's low ratio is what keeps the joint backdrivable.",
          media: [
            { image: "", caption: "The actuator design" },
          ],
        },
        {
          date:  "Stage 2",
          title: "Motor-characterization bench",
          text:  "Built a test bench around an ODrive v3.6 and an ESP32. A Python logger uses the ODrive polling loop as its master clock, reads the ESP32's output-side sensors on a background thread and writes one time-aligned CSV (velocity, current, power and faults next to the output-side measurements) for efficiency mapping.",
          media: [
            { image: "", caption: "The test bench" },
          ],
        },
        {
          date:  "Stage 3",
          title: "Twelve actuators",
          text:  "Fabricated all twelve actuators in-house, one for every joint of the robot.",
          media: [
            { image: "", caption: "The twelve actuators" },
          ],
        },
        {
          date:  "Stage 4",
          title: "The 12-DoF structure",
          text:  "Fabricated and assembled the robot's full 12-DoF structure: four legs with three actuated joints each, designed to carry an IMU and a depth camera.",
          media: [
            { image: "", caption: "The assembled robot" },
          ],
        },
        {
          date:  "Next",
          title: "Locomotion experiments",
          text:  "Locomotion experiments on mud, using the IMU and depth-camera sensing the platform was designed to carry.",
        },
      ],
    },

    rover: {
      title:  "MEER 2.0 Mars Rover",
      short:  "Mars rover",
      kicker: "Team Ogrodoot · 2024–2026",
      tone:   "rust",
      icon:   "i-rover",
      page:   "projects/rover.html",
      cover: {
        image:   "images/rover.jpg",
        video:   "",
        alt:     "MEER 2.0 Mars rover built by Team Ogrodoot",
        caption: "MEER 2.0, Team Ogrodoot's Mars rover.",
      },
      log: [
        {
          date:  "Oct 2024",
          title: "Joined Team Ogrodoot",
          text:  "Joined the MEER 2.0 rover team as a mechanical design and fabrication member.",
        },
        {
          date:  "2024–2026",
          title: "Designing the rover's mechanics",
          text:  "Designed the 4-wheel rocker-bogie chassis, differential suspension, custom wheel assemblies and 5-DoF robotic arm, plus the actuator mechanisms and a motor-driven lead-screw gripper for payload manipulation.",
          media: [
            { image: "", caption: "The chassis and suspension" },
            { image: "", caption: "The robotic arm and gripper" },
          ],
        },
        {
          date:  "2025",
          title: "IRDC semi-finals",
          text:  "Semi-finalists at the International Rover Design Challenge (Space Robotics Society).",
          media: [
            { certificate: "irdc-2025" },
          ],
        },
        {
          date:  "Aug 2025",
          title: "Co-lead of the team",
          text:  "Became co-lead of Team Ogrodoot and head of its mechanical sub-team.",
        },
        {
          date:  "2025–2026",
          title: "Mentoring the next members",
          text:  "Ran 20+ sessions for junior members on mechanical-team practice and CAD design in Fusion 360, and helped recruit new members.",
          media: [
            { video: "https://youtu.be/nPx6YfSVWWA", caption: "Fusion 360 Fundamentals for Team Ogrodoot", captions: "en", length: "52 min" },
          ],
        },
        {
          date:  "2026",
          title: "Anatolian Rover Challenge finals",
          text:  "Finalists at the Anatolian Rover Challenge 2026: 13th overall, with the competition's highest design score.",
          media: [
            { image: "", caption: "The team at ARC 2026" },
            { certificate: "arc-2026" },
          ],
        },
      ],
    },

    glider: {
      title:  "Underwater Glider for Aquatic Environmental Monitoring",
      short:  "Underwater glider",
      kicker: "Marine robotics",
      tone:   "sea",
      icon:   "i-wave",
      page:   "projects/glider.html",
      cover: {
        image:   "images/glider.jpg",
        video:   "",
        alt:     "Underwater glider for water-quality monitoring",
        caption: "The underwater glider.",
      },
      log: [
        {
          date:  "Stage 1",
          title: "Buoyancy-based depth control",
          text:  "Developed the glider's buoyancy-based depth control.",
          media: [
            { image: "", caption: "The glider" },
          ],
        },
        {
          date:  "Stage 2",
          title: "Water-quality sensing",
          text:  "Integrated dissolved-oxygen, ORP, turbidity and TDS sensors for water-quality monitoring.",
        },
      ],
    },

    agrosense: {
      title:  "AgroSense: Smart-Farming Sensor Network",
      short:  "AgroSense",
      kicker: "SystemSage Solutions · 2024",
      tone:   "leaf",
      icon:   "i-sprout",
      page:   "projects/agrosense.html",
      cover: {
        image:   "images/iot-node.jpg",
        video:   "",
        alt:     "AgroSense field sensor node",
        caption: "An AgroSense field node.",
      },
      log: [
        {
          date:  "2024",
          title: "Choosing the cellular link",
          text:  "Prototyped and compared several GSM modules. 2G proved too slow and unreliable, so the final design uses 4G through a SIMCom A7670C module.",
        },
        {
          date:  "2024",
          title: "The LoRa link",
          text:  "Set up the LoRa link between the field nodes (Child Modules) and the gateway (Mother Module): first one-way, then two-way.",
          media: [
            { video: "", caption: "One-way LoRa test" },
            { video: "", caption: "Two-way LoRa link" },
          ],
        },
        {
          date:  "2024",
          title: "Boards, wiring and firmware",
          text:  "Designed the PCBs, finalized the wiring and wrote the firmware for the Child, Mother and Control Modules. The Control Module switches pumps and lights through relays: manually from the website, automatically when a reading leaves a set range, or on a schedule.",
          media: [
            { image: "", caption: "The PCBs" },
            { image: "", caption: "The full setup, working in my room" },
          ],
        },
        {
          date:  "2024",
          title: "Solar power",
          text:  "Sized the solar supply (panel, battery and charge controller) from the modules' power consumption, so the field nodes can run away from mains power.",
        },
        {
          date:  "Sep 2024",
          title: "The complete system",
          text:  "Recorded the complete system working: a field node, the web dashboard and the Control Module's manual, automatic and scheduled modes.",
          media: [
            { video: "", caption: "AgroSense demo, September 2024" },
          ],
        },
        {
          date:  "Dec 2024",
          title: "Published at GEn-CITy 2024",
          text:  [
            "Co-authored the paper on the system, published in the GEn-CITy 2024 proceedings (IET Conference Proceedings, also in IEEE Xplore): <a href=\"https://doi.org/10.1049/icp.2025.0238\" target=\"_blank\" rel=\"noopener\">doi:10.1049/icp.2025.0238</a>.",
            "Reported results: the LoRa link was tested out to 500 m with fewer than 1 in 1,000 packets lost; the field nodes ran 3 days on battery without enough sunlight; relay control responded almost instantly in good conditions and within 3 s in poor ones.",
          ],
          media: [
            { certificate: "gencity-2024" },
          ],
        },
      ],
    },
  },

  /* ------------------------ CERTIFICATES & CRESTS ------------------------
     Enter each certificate or crest ONCE. It then appears everywhere it
     belongs, always from the same file:
       - the "Certificates & Crests" section on the home page;
       - the pages of the projects listed in  projects: ["rover"];
       - a "View certificate" button on the Honors & Awards row named in
         award: "arc-2026";
       - inside a build-log entry that says  { certificate: "arc-2026" }.
     To switch one on: put the scan in images/certificates/ and write its
     path in image: "". Entries with an empty image stay hidden, and the
     whole section stays hidden until the first one has an image.
     kind:  "certificate" or "crest".
     pdf:   optional link to a PDF copy (e.g. images/certificates/x.pdf).
     Titles below are placeholders: match them to what each one says.
  ------------------------------------------------------------------------ */
  certificates: [
    {
      id:       "arc-2026",
      title:    "Finalist, Highest Design Score",
      issuer:   "Anatolian Rover Challenge (ARC)",
      date:     "2026",
      kind:     "certificate",
      image:    "",
      pdf:      "",
      projects: ["rover"],
      award:    "arc-2026",
    },
    {
      id:       "irdc-2025",
      title:    "Semi-finalist",
      issuer:   "International Rover Design Challenge (IRDC), Space Robotics Society",
      date:     "2025",
      kind:     "certificate",
      image:    "",
      pdf:      "",
      projects: ["rover"],
      award:    "irdc-2025",
    },
    {
      id:       "innovista-2025",
      title:    "Poster Presentation, 1st Place",
      issuer:   "RUET Innovista",
      date:     "2025",
      kind:     "certificate",
      image:    "",
      pdf:      "",
      projects: [],
      award:    "innovista-2025",
    },
    {
      id:       "astro-2024",
      title:    "Project Showcase, 2nd Place",
      issuer:   "Astro Science Fair, BSMR Novo Theatre, Rajshahi",
      date:     "2024",
      kind:     "certificate",
      image:    "",
      pdf:      "",
      projects: [],
      award:    "astro-2024",
    },
    {
      id:       "techmayhem-2023",
      title:    "Line-Following Robot Competition, 1st Place",
      issuer:   "Tech-Mayhem, Robotic Society of RUET",
      date:     "2023",
      kind:     "certificate",
      image:    "",
      pdf:      "",
      projects: [],
      award:    "techmayhem-2023",
    },
    // Only if the conference gave you a certificate; otherwise leave image empty.
    {
      id:       "gencity-2024",
      title:    "Conference Certificate",
      issuer:   "GEn-CITy 2024",
      date:     "Dec 2024",
      kind:     "certificate",
      image:    "",
      pdf:      "",
      projects: ["agrosense"],
    },
    {
      id:       "python-edge-2025",
      title:    "Basic Programming with Python (60 hours)",
      issuer:   "IICT, RUET · EDGE project, Bangladesh Computer Council",
      date:     "Feb 2025",
      kind:     "certificate",
      image:    "",
      pdf:      "",
      projects: [],
    },
    {
      id:       "walton-2025",
      title:    "Industrial Attachment",
      issuer:   "Walton Hi-Tech Industries PLC",
      date:     "Mar 2025",
      kind:     "certificate",
      image:    "",
      pdf:      "",
      projects: [],
    },

    /* To add another one, copy this block above this comment and fill it in.
       A second item for the same award (a certificate AND a crest) is fine:
       the award row then gets a button for each.
    {
      id:       "short-unique-name",
      title:    "What it is for",
      issuer:   "Who gave it",
      date:     "2025",
      kind:     "crest",
      image:    "images/certificates/short-unique-name.jpg",
      pdf:      "",
      projects: [],
      award:    "",
    },
    */
  ],
};
