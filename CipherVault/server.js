
        document.addEventListener("DOMContentLoaded", function () {
            // Get the current page's URL path
            var currentPage = window.location.pathname;
            
            // Ensure the current page path starts with a '/'
            if (currentPage.charAt(0) !== '/') {
                currentPage = '/' + currentPage;
            }
        
            // Find all links in the nav
            var navLinks = document.querySelectorAll('nav a');
        
            navLinks.forEach(function(link) {
                // Get the href of the link (relative path)
                var linkHref = link.getAttribute('href');
        
                // Ensure the link's href starts with a '/'
                if (linkHref.charAt(0) !== '/') {
                    linkHref = '/' + linkHref;
                }
        
                // Compare the link's href with the current page path
                if (currentPage === linkHref) {
                    link.classList.add("active"); // Add 'active' class to the current link
                }
            });
        });
        